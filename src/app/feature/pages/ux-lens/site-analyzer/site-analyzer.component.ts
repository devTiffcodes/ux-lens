import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SiteAnalyzerService } from '../../../../data/services/site-analyzer.service';
import { ClaudeService } from '../../../../data/services/claude.service';
import { FirebaseService } from '../../../../data/services/firebase.service';
import { Location } from '@angular/common';
import { serverTimestamp } from 'firebase/firestore';

export interface UxLawEntry {
  law: string;
  status: 'pass' | 'partial' | 'fail';
  score: number;
  note: string;
}

export interface UxLawCategory {
  category: string;
  laws: UxLawEntry[];
}

@Component({
  selector: 'app-site-analyzer',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './site-analyzer.component.html',
  styleUrls: ['./site-analyzer.component.css', '../../../shared/styles/analysis-shared.css'],
})
export class SiteAnalyzerComponent {
  private readonly fb = inject(FormBuilder);
  private readonly location = inject(Location);
  private readonly firebase = inject(FirebaseService);
  protected readonly siteAnalyzerService = inject(SiteAnalyzerService);
  protected readonly claudeService = inject(ClaudeService);

  protected readonly mentorQuestion = signal<string>('');
  protected readonly activeTab = signal<'url' | 'wireframe'>('url');
  protected readonly wireframeFile = signal<File | null>(null);
  protected readonly wireframePreview = signal<string | null>(null);
  protected readonly wireframeLoading = signal<boolean>(false);
  protected readonly wireframeResult = signal<string | null>(null);
  protected readonly wireframeError = signal<string | null>(null);

  protected readonly uxLawScores = signal<UxLawCategory[]>([]);
  protected readonly feedbackRating = signal<'up' | 'down' | null>(null);
  protected readonly ratingSubmitted = signal<boolean>(false);
  protected readonly ratingError = signal<string | null>(null);

  private savedAnalysisId = signal<string | null>(null);

  protected readonly urlForm = this.fb.nonNullable.group({
    url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
  });

  protected goBack(): void {
    this.location.back();
  }

  protected setTab(tab: 'url' | 'wireframe'): void {
    this.activeTab.set(tab);
  }

  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.wireframeFile.set(file);
    this.wireframeResult.set(null);
    this.wireframeError.set(null);
    const reader = new FileReader();
    reader.onload = () => this.wireframePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  protected async analyzeWireframe(): Promise<void> {
    const file = this.wireframeFile();
    if (!file) return;
    this.wireframeLoading.set(true);
    this.wireframeResult.set(null);
    this.wireframeError.set(null);
    try {
      const base64 = await this.fileToBase64(file);
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'wireframe', image: base64, mimeType: file.type }),
      });
      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      this.wireframeResult.set(data.feedback ?? 'No feedback returned.');
    } catch {
      this.wireframeError.set('Failed to analyze wireframe. Please try again.');
    } finally {
      this.wireframeLoading.set(false);
    }
  }

  protected resetWireframe(): void {
    this.wireframeFile.set(null);
    this.wireframePreview.set(null);
    this.wireframeResult.set(null);
    this.wireframeError.set(null);
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  protected async onAnalyze(): Promise<void> {
    if (this.urlForm.invalid) {
      this.urlForm.markAllAsTouched();
      return;
    }
    this.claudeService.reset();
    this.uxLawScores.set([]);
    this.feedbackRating.set(null);
    this.ratingSubmitted.set(false);
    this.ratingError.set(null);
    this.savedAnalysisId.set(null);

    const { url } = this.urlForm.getRawValue();
    try {
      await this.siteAnalyzerService.analyzeUrl(url);
    } catch {
      // error captured in siteAnalyzerService.error signal
    }
  }

  protected async askMentor(): Promise<void> {
    const result = this.siteAnalyzerService.result();
    if (!result) return;

    this.feedbackRating.set(null);
    this.ratingSubmitted.set(false);
    this.ratingError.set(null);

    await this.claudeService.getMentorFeedback({
      pageName: result.url,
      uxMode: 'poor',
      issues: result.issues,
      wellbeingScore: result.wellbeingScore,
      userQuestion: this.mentorQuestion(),
    });

    const raw = this.claudeService.lastRawResponse();
    if (raw?.uxLawScores?.length) {
      this.uxLawScores.set(raw.uxLawScores);
    }

    await this.saveAnalysis();
    this.mentorQuestion.set('');
  }

  private async saveAnalysis(): Promise<void> {
    const result = this.siteAnalyzerService.result();
    const feedback = this.claudeService.lastResponse();
    if (!result || !feedback) return;

    try {
      const id = await this.firebase.addDocument('site-analyses', {
        url: result.url,
        analyzedAt: serverTimestamp(),
        scores: result.scores,
        wellbeingScore: result.wellbeingScore,
        issueCount: result.issues.length,
        uxLawScores: this.uxLawScores(),
        mentorFeedback: feedback,
        feedbackRating: null,
      });
      this.savedAnalysisId.set(id);
    } catch (err) {
      console.error('Failed to save analysis:', err);
    }
  }

  protected async submitRating(rating: 'up' | 'down'): Promise<void> {
    if (this.ratingSubmitted()) return;
    this.feedbackRating.set(rating);
    this.ratingError.set(null);

    const docId = this.savedAnalysisId();
    if (docId) {
      try {
        const { doc, updateDoc } = await import('firebase/firestore');
        const ref = doc(this.firebase.db, 'site-analyses', docId);
        await updateDoc(ref, { feedbackRating: rating });
      } catch {
        this.ratingError.set('Could not save rating. Please try again.');
        this.feedbackRating.set(null);
        return;
      }
    }
    this.ratingSubmitted.set(true);
  }

  protected onMentorInput(event: Event): void {
    this.mentorQuestion.set((event.target as HTMLTextAreaElement).value);
  }

  protected severityClass(severity: string): string {
    return `severity-${severity}`;
  }

  protected overallScore(categories: UxLawCategory[]): number {
    const all = categories.flatMap(c => c.laws);
    if (!all.length) return 0;
    return Math.round(all.reduce((sum, l) => sum + l.score, 0) / all.length);
  }

  protected badgeLabel(score: number): string {
    if (score >= 70) return 'Good Standards';
    if (score >= 40) return 'Needs Improvement';
    return 'Poor Standards';
  }

  protected badgeClass(score: number): string {
    if (score >= 70) return 'badge-pass';
    if (score >= 40) return 'badge-partial';
    return 'badge-fail';
  }

  protected categoryScore(laws: UxLawEntry[]): number {
    if (!laws.length) return 0;
    return Math.round(laws.reduce((sum, l) => sum + l.score, 0) / laws.length);
  }

  protected startOver(): void {
    this.siteAnalyzerService.reset();
    this.claudeService.reset();
    this.urlForm.reset();
    this.uxLawScores.set([]);
    this.feedbackRating.set(null);
    this.ratingSubmitted.set(false);
    this.ratingError.set(null);
    this.savedAnalysisId.set(null);
  }
}
