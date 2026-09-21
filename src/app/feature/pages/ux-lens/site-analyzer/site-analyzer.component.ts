import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { serverTimestamp } from 'firebase/firestore';

import { SiteAnalyzerService } from '../../../../data/services/site-analyzer.service';
import { ClaudeService } from '../../../../data/services/claude.service';
import { FirebaseService } from '../../../../data/services/firebase.service';

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
  styleUrls: [
    './site-analyzer.component.css',
    '../../../shared/styles/analysis-shared.css',
  ],
})
export class SiteAnalyzerComponent {
  private readonly fb = inject(FormBuilder);
  private readonly location = inject(Location);
  private readonly firebase = inject(FirebaseService);

  protected readonly siteAnalyzerService = inject(SiteAnalyzerService);
  protected readonly claudeService = inject(ClaudeService);

  // ========================================================================
  // UI STATE
  // ========================================================================

  protected readonly mentorQuestion = signal<string>('');
  protected readonly activeTab = signal<'url' | 'wireframe'>('url');

  // ========================================================================
  // WIREFRAME STATE
  // ========================================================================

  protected readonly wireframeFile = signal<File | null>(null);
  protected readonly wireframePreview = signal<string | null>(null);
  protected readonly wireframeLoading = signal<boolean>(false);
  protected readonly wireframeResult = signal<string | null>(null);
  protected readonly wireframeError = signal<string | null>(null);

  // ========================================================================
  // UX LAW STATE
  // ========================================================================

  protected readonly uxLawScores = signal<UxLawCategory[]>([]);
  protected readonly uxLawLoading = signal<boolean>(false);
  protected readonly uxLawError = signal<string | null>(null);

  // ========================================================================
  // FEEDBACK STATE
  // ========================================================================

  protected readonly feedbackRating =
    signal<'up' | 'down' | null>(null);

  protected readonly ratingSubmitted =
    signal<boolean>(false);

  protected readonly ratingError =
    signal<string | null>(null);

  private readonly savedAnalysisId =
    signal<string | null>(null);

  // ========================================================================
  // URL FORM
  // ========================================================================

  protected readonly urlForm = this.fb.nonNullable.group({
    url: [
      '',
      [
        Validators.required,
        Validators.pattern(/^https?:\/\/.+/),
      ],
    ],
  });

  // ========================================================================
  // NAVIGATION
  // ========================================================================

  protected goBack(): void {
    this.location.back();
  }

  protected setTab(tab: 'url' | 'wireframe'): void {
    this.activeTab.set(tab);
  }

  // ========================================================================
  // WIREFRAME ANALYZER
  // ========================================================================

  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    // 5 MB validation
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      this.wireframeError.set(
        'The selected image is too large. Please choose an image under 5MB.'
      );

      input.value = '';
      return;
    }

    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      this.wireframeError.set(
        'Please upload a PNG, JPG, or WEBP image.'
      );

      input.value = '';
      return;
    }

    this.wireframeFile.set(file);
    this.wireframeResult.set(null);
    this.wireframeError.set(null);

    const reader = new FileReader();

    reader.onload = () => {
      this.wireframePreview.set(reader.result as string);
    };

    reader.onerror = () => {
      this.wireframeError.set(
        'Could not preview the selected image.'
      );
    };

    reader.readAsDataURL(file);
  }

  protected async analyzeWireframe(): Promise<void> {
    const file = this.wireframeFile();

    if (!file) {
      return;
    }

    this.wireframeLoading.set(true);
    this.wireframeResult.set(null);
    this.wireframeError.set(null);

    try {
      const base64 = await this.fileToBase64(file);

      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'wireframe',
          image: base64,
          mimeType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();

      this.wireframeResult.set(
        data.feedback ?? 'No feedback returned.'
      );

    } catch (error) {
      console.error('Wireframe analysis failed:', error);

      this.wireframeError.set(
        'Failed to analyze wireframe. Please try again.'
      );

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

      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };

      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  }

  // ========================================================================
  // ANALYSIS STATUS TICKER
  // ========================================================================

  protected readonly analysisStatus =
    signal<string>('');

  private statusInterval:
    ReturnType<typeof setInterval> | null = null;

  private readonly statusMessages = [
    'Fetching page resources...',
    'Running Lighthouse audit...',
    'Checking accessibility...',
    'Evaluating colour contrast...',
    'Measuring performance...',
    'Scanning SEO signals...',
    'Reviewing best practices...',
    'Mapping issues to UX laws...',
    'Almost there...',
  ];

  private startStatusTicker(): void {
    let i = 0;

    this.analysisStatus.set(
      this.statusMessages[0]
    );

    this.statusInterval = setInterval(() => {

      i = (i + 1) % this.statusMessages.length;

      this.analysisStatus.set(
        this.statusMessages[i]
      );

    }, 1800);
  }

  private stopStatusTicker(): void {

    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
    }

    this.analysisStatus.set('');
  }

  // ========================================================================
  // MAIN SITE ANALYSIS
  // ========================================================================

  protected async onAnalyze(): Promise<void> {

    if (this.urlForm.invalid) {

      this.urlForm.markAllAsTouched();
      return;
    }

    // Reset any previous analysis state
    this.claudeService.reset();

    this.uxLawScores.set([]);
    this.uxLawLoading.set(false);
    this.uxLawError.set(null);

    this.feedbackRating.set(null);
    this.ratingSubmitted.set(false);
    this.ratingError.set(null);

    this.savedAnalysisId.set(null);

    this.startStatusTicker();

    const { url } = this.urlForm.getRawValue();

    try {

      // First run the actual Lighthouse/site analysis.
      await this.siteAnalyzerService.analyzeUrl(url);

      // Once the website results are ready, automatically
      // run the UX law mapping.
      if (this.siteAnalyzerService.result()) {
        await this.analyzeUxLaws();
      }

    } catch (error) {

      console.error('Site analysis failed:', error);

      // The SiteAnalyzerService already exposes its own error
      // through its error() signal.

    } finally {

      this.stopStatusTicker();

    }
  }

  // ========================================================================
  // AUTOMATIC UX LAW ANALYSIS
  // ========================================================================

  private async analyzeUxLaws(): Promise<void> {

    const result = this.siteAnalyzerService.result();

    if (!result) {
      return;
    }

    this.uxLawScores.set([]);
    this.uxLawError.set(null);
    this.uxLawLoading.set(true);

    try {

      /*
       * We reuse the existing ClaudeService because it already knows how
       * to analyze the site issues and return uxLawScores.
       *
       * IMPORTANT:
       * This call does NOT represent the user's AI Mentor interaction.
       * It is only being used here to generate the automatic UX-law
       * compliance result.
       */
      await this.claudeService.getMentorFeedback({
        pageName: result.url,
        uxMode: 'poor',
        issues: result.issues,
        wellbeingScore: result.wellbeingScore,
        userQuestion: '',
      });

      const raw = this.claudeService.lastRawResponse();

      if (raw?.uxLawScores?.length) {

        this.uxLawScores.set(
          raw.uxLawScores
        );

      } else {

        this.uxLawError.set(
          this.claudeService.error() ??
          'UX law analysis could not be generated.'
        );
      }

    } catch (error) {

      console.error(
        'UX law analysis failed:',
        error
      );

      this.uxLawError.set(
        'Could not analyze the UX laws. Please try again.'
      );

    } finally {

      /*
       * Clear the ClaudeService response after extracting the
       * UX-law scores so the automatic analysis does not appear
       * as an AI Mentor response.
       */
      this.claudeService.reset();

      this.uxLawLoading.set(false);
    }
  }

  // ========================================================================
  // AI MENTOR
  // ========================================================================

  protected async askMentor(): Promise<void> {

    const result = this.siteAnalyzerService.result();

    if (!result) {
      return;
    }

    const question = this.mentorQuestion().trim();

    this.feedbackRating.set(null);
    this.ratingSubmitted.set(false);
    this.ratingError.set(null);

    await this.claudeService.getMentorFeedback({
      pageName: result.url,
      uxMode: 'poor',
      issues: result.issues,
      wellbeingScore: result.wellbeingScore,
      userQuestion: question,
    });

    const raw = this.claudeService.lastRawResponse();

    /*
     * Keep the current UX-law scores if the Mentor response
     * does not provide them.
     *
     * If the Mentor response does provide updated scores,
     * use those values.
     */
    if (raw?.uxLawScores?.length) {
      this.uxLawScores.set(raw.uxLawScores);
    }

    await this.saveAnalysis();

    this.mentorQuestion.set('');
  }

  protected onMentorInput(event: Event): void {

    const target =
      event.target as HTMLTextAreaElement;

    this.mentorQuestion.set(
      target.value
    );
  }

  // ========================================================================
  // SAVE ANALYSIS
  // ========================================================================

  private async saveAnalysis(): Promise<void> {

    const result =
      this.siteAnalyzerService.result();

    const feedback =
      this.claudeService.lastResponse();

    if (!result || !feedback) {
      return;
    }

    try {

      const id =
        await this.firebase.addDocument(
          'site-analyses',
          {
            url: result.url,
            analyzedAt: serverTimestamp(),
            scores: result.scores,
            wellbeingScore: result.wellbeingScore,
            issueCount: result.issues.length,
            uxLawScores: this.uxLawScores(),
            mentorFeedback: feedback,
            feedbackRating: null,
          }
        );

      this.savedAnalysisId.set(id);

    } catch (err) {

      console.error(
        'Failed to save analysis:',
        err
      );
    }
  }

  // ========================================================================
  // FEEDBACK RATING
  // ========================================================================

  protected async submitRating(
    rating: 'up' | 'down'
  ): Promise<void> {

    if (this.ratingSubmitted()) {
      return;
    }

    this.feedbackRating.set(rating);
    this.ratingError.set(null);

    const docId =
      this.savedAnalysisId();

    if (docId) {

      try {

        const {
          doc,
          updateDoc,
        } = await import('firebase/firestore');

        const ref =
          doc(
            this.firebase.db,
            'site-analyses',
            docId
          );

        await updateDoc(
          ref,
          {
            feedbackRating: rating,
          }
        );

      } catch (error) {

        console.error(
          'Failed to save rating:',
          error
        );

        this.ratingError.set(
          'Could not save rating. Please try again.'
        );

        this.feedbackRating.set(null);

        return;
      }
    }

    this.ratingSubmitted.set(true);
  }

  // ========================================================================
  // SCORE HELPERS
  // ========================================================================

  protected severityClass(
    severity: string
  ): string {

    return `severity-${severity}`;
  }

  protected overallScore(
    categories: UxLawCategory[]
  ): number {

    const all =
      categories.flatMap(
        category => category.laws
      );

    if (!all.length) {
      return 0;
    }

    return Math.round(
      all.reduce(
        (sum, law) => sum + law.score,
        0
      ) / all.length
    );
  }

  protected categoryScore(
    laws: UxLawEntry[]
  ): number {

    if (!laws.length) {
      return 0;
    }

    return Math.round(
      laws.reduce(
        (sum, law) => sum + law.score,
        0
      ) / laws.length
    );
  }

  protected badgeLabel(
    score: number
  ): string {

    if (score >= 70) {
      return 'Good Standards';
    }

    if (score >= 40) {
      return 'Needs Improvement';
    }

    return 'Poor Standards';
  }

  protected badgeClass(
    score: number
  ): string {

    if (score >= 70) {
      return 'badge-pass';
    }

    if (score >= 40) {
      return 'badge-partial';
    }

    return 'badge-fail';
  }

  // ========================================================================
  // START OVER
  // ========================================================================

  protected startOver(): void {

    this.siteAnalyzerService.reset();
    this.claudeService.reset();

    this.urlForm.reset();

    this.uxLawScores.set([]);
    this.uxLawLoading.set(false);
    this.uxLawError.set(null);

    this.mentorQuestion.set('');

    this.feedbackRating.set(null);
    this.ratingSubmitted.set(false);
    this.ratingError.set(null);

    this.savedAnalysisId.set(null);

    this.stopStatusTicker();
  }
}
