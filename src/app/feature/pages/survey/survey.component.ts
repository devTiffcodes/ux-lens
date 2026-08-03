import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SurveyRepository } from '../../../data/repositories/survey.repository';
import { UxModeService } from '../../../core/services/ux-mode.service';
import { SurveyResponse } from '../../../domain/models/survey-response.model';

const PAGE_OPTIONS = ['home', 'events', 'noticeboard', 'local-info', 'contact'];

@Component({
  selector: 'app-survey',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './survey.component.html',
  styleUrl: './survey.component.css',
})
export class SurveyComponent {
  private readonly fb = inject(FormBuilder);
  private readonly surveyRepository = inject(SurveyRepository);
  protected readonly uxModeService = inject(UxModeService);

  protected readonly pageOptions = PAGE_OPTIONS;
  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly submitSuccess = signal<boolean>(false);

  protected readonly surveyForm = this.fb.nonNullable.group({
    stress: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    ease: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    overwhelmed: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    satisfaction: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    openFeedback: [''],
    pagesTested: this.fb.nonNullable.array<boolean>(PAGE_OPTIONS.map(() => false)),
  });

  protected togglePage(index: number): void {
    const control = this.surveyForm.controls.pagesTested.at(index);
    control.setValue(!control.value);
  }

  protected async onSubmit(): Promise<void> {
    if (this.surveyForm.invalid) {
      this.surveyForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const raw = this.surveyForm.getRawValue();
    const selectedPages = this.pageOptions.filter((_, i) => raw.pagesTested[i]);

    const response: SurveyResponse = {
      sessionId: crypto.randomUUID(),
      uxMode: this.uxModeService.isPoorMode() ? 'poor' : 'good',
      submittedAt: new Date(),
      stress: raw.stress,
      ease: raw.ease,
      overwhelmed: raw.overwhelmed,
      satisfaction: raw.satisfaction,
      openFeedback: raw.openFeedback,
      pagesTested: selectedPages,
    };

    try {
      await this.surveyRepository.save(response);
      this.submitSuccess.set(true);
      this.surveyForm.reset({
        stress: 3,
        ease: 3,
        overwhelmed: 3,
        satisfaction: 3,
        openFeedback: '',
        pagesTested: PAGE_OPTIONS.map(() => false),
      });
    } catch (err) {
      this.submitError.set(
        err instanceof Error ? err.message : 'Failed to submit survey. Please try again.'
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
