import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SiteAnalyzerService } from '../../../data/services/site-analyzer.service';
import { ClaudeService } from '../../../data/services/claude.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-site-analyzer',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './site-analyzer.component.html',
  styleUrls: ['./site-analyzer.component.css', '../../shared/styles/analysis-shared.css'],
})
export class SiteAnalyzerComponent {
  private readonly fb = inject(FormBuilder);
  private readonly location = inject(Location);
  protected readonly siteAnalyzerService = inject(SiteAnalyzerService);
  protected readonly claudeService = inject(ClaudeService);

  protected readonly mentorQuestion = signal<string>('');
  protected readonly activeTab = signal<'url' | 'wireframe'>('url');
  protected readonly wireframeFile = signal<File | null>(null);
  protected readonly wireframePreview = signal<string | null>(null);
  protected readonly wireframeLoading = signal<boolean>(false);
  protected readonly wireframeResult = signal<string | null>(null);
  protected readonly wireframeError = signal<string | null>(null);

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
    reader.onload = () => {
      this.wireframePreview.set(reader.result as string);
    };
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
        body: JSON.stringify({
          type: 'wireframe',
          image: base64,
          mimeType: file.type,
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      this.wireframeResult.set(data.feedback ?? 'No feedback returned.');
    } catch (err) {
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
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
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
    const { url } = this.urlForm.getRawValue();
    try {
      await this.siteAnalyzerService.analyzeUrl(url);
    } catch {
      // Error already captured in siteAnalyzerService.error signal.
    }
  }

  protected async askMentor(): Promise<void> {
    const result = this.siteAnalyzerService.result();
    if (!result) return;

    await this.claudeService.getMentorFeedback({
      pageName: result.url,
      uxMode: 'poor',
      issues: result.issues,
      wellbeingScore: result.wellbeingScore,
      userQuestion: this.mentorQuestion(),
    });

    this.mentorQuestion.set('');
  }

  protected onMentorInput(event: Event): void {
    this.mentorQuestion.set((event.target as HTMLTextAreaElement).value);
  }

  protected severityClass(severity: string): string {
    return `severity-${severity}`;
  }

  protected startOver(): void {
    this.siteAnalyzerService.reset();
    this.claudeService.reset();
    this.urlForm.reset();
  }
}
