import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SiteAnalyzerService } from '../../../data/services/site-analyzer.service';
import { ClaudeService } from '../../../data/services/claude.service';

@Component({
  selector: 'app-site-analyzer',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './site-analyzer.component.html',
  styleUrls: ['./site-analyzer.component.css', '../../shared/styles/analysis-shared.css'],
})
export class SiteAnalyzerComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly siteAnalyzerService = inject(SiteAnalyzerService);
  protected readonly claudeService = inject(ClaudeService);

  protected readonly mentorQuestion = signal<string>('');

  protected readonly urlForm = this.fb.nonNullable.group({
    url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
  });

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
    if (!result) {
      return;
    }

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
