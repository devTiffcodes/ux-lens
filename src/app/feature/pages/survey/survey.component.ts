import { Component, inject, signal, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormArray,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Location } from '@angular/common';
import { orderBy } from 'firebase/firestore';
import { FirebaseService } from '../../../data/services/firebase.service';
import { SurveyRepository } from '../../../data/repositories/survey.repository';
import { UxModeService } from '../../../core/services/ux-mode.service';
import { SurveyResponse } from '../../../domain/models/survey-response.model';

type SurveyQuestionValues = Pick<
  SurveyResponse,
  | 'taskEase'
  | 'taskSuccess'
  | 'taskFrustration'
  | 'cognitiveEffort'
  | 'informationClarity'
  | 'overwhelmed'
  | 'stressLevel'
  | 'confidence'
  | 'enjoyment'
  | 'visualClarity'
  | 'eyeStrain'
  | 'aestheticAppeal'
  | 'overallSatisfaction'
  | 'wellbeingImpact'
>;

// ── Types ──────────────────────────────────────────────────────────────────

const PAGE_OPTIONS = ['home', 'events', 'noticeboard', 'courses', 'resources', 'profile'];

export interface SurveyQuestion {
  id: string;
  section: string;
  order: number;
  text: string;
  controlName: string;
  lowLabel: string;
  highLabel: string;
  reversed: boolean;
}

export interface SurveySection {
  title: string;
  sectionKey: string;
  questions: SurveyQuestion[];
}

const SECTION_TITLES: Record<string, string> = {
  taskCompletion: 'Task Completion',
  cognitiveLoad: 'Cognitive Load',
  emotionalWellbeing: 'Emotional Wellbeing',
  visualComfort: 'Visual Comfort',
  overall: 'Overall',
};

const SECTION_ORDER = [
  'taskCompletion',
  'cognitiveLoad',
  'emotionalWellbeing',
  'visualComfort',
  'overall',
];

// ── Component ──────────────────────────────────────────────────────────────

@Component({
  selector: 'app-survey',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './survey.component.html',
  styleUrl: './survey.component.css',
})
export class SurveyComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly firebaseService = inject(FirebaseService);
  private readonly surveyRepository = inject(SurveyRepository);
  protected readonly uxModeService = inject(UxModeService);
  private readonly location = inject(Location);

  // ── State ----------------------------------------------------------------

  protected readonly pageOptions = PAGE_OPTIONS;
  protected readonly sections = signal<SurveySection[]>([]);
  private readonly allQuestions = signal<SurveyQuestion[]>([]);

  protected readonly isLoading = signal<boolean>(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly submitSuccess = signal<boolean>(false);

  // ── Form -----------------------------------------------------------------

  protected readonly surveyForm = this.fb.group({
    openFeedback: [''],
    pagesTested: this.fb.array(PAGE_OPTIONS.map(() => this.fb.control(false))),
  }) as FormGroup;

  get pagesTestedArray(): FormArray {
    return this.surveyForm.get('pagesTested') as FormArray;
  }

  // ── Lifecycle ------------------------------------------------------------

  async ngOnInit(): Promise<void> {
    await this.loadQuestions();
  }

  // ── Data loading ---------------------------------------------------------

  private async loadQuestions(): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set(null);

    try {
      const questions = await this.firebaseService.getDocuments<SurveyQuestion>(
        'survey_questions',
        [orderBy('order')]
      );

      this.allQuestions.set(questions);
      this.buildFormControls(questions);
      this.groupIntoSections(questions);
    } catch (err) {
      this.loadError.set('Could not load survey questions. Please refresh and try again.');
      console.error('[SurveyComponent] loadQuestions error:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  private buildFormControls(questions: SurveyQuestion[]): void {
    for (const q of questions) {
      this.surveyForm.addControl(
        q.controlName,
        this.fb.control(3, [Validators.required, Validators.min(1), Validators.max(5)])
      );
    }
  }

  private groupIntoSections(questions: SurveyQuestion[]): void {
    const map = new Map<string, SurveyQuestion[]>();
    for (const q of questions) {
      if (!map.has(q.section)) map.set(q.section, []);
      map.get(q.section)!.push(q);
    }

    const sections: SurveySection[] = SECTION_ORDER
      .filter((key) => map.has(key))
      .map((key) => ({
        title: SECTION_TITLES[key] ?? key,
        sectionKey: key,
        questions: map.get(key)!,
      }));

    this.sections.set(sections);
  }

  // ── Helpers --------------------------------------------------------------

  protected getControl(name: string) {
    return this.surveyForm.get(name);
  }

  protected togglePage(index: number): void {
    const control = this.pagesTestedArray.at(index);
    control.setValue(!control.value);
  }

  protected goBack(): void {
    this.location.back();
  }

  // ── Submit ---------------------------------------------------------------

  protected async onSubmit(): Promise<void> {
    if (this.surveyForm.invalid) {
      this.surveyForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const raw = this.surveyForm.getRawValue() as Record<string, unknown>;
    const pagesRaw = raw['pagesTested'] as boolean[];
    const selectedPages = this.pageOptions.filter((_, i) => pagesRaw[i]);

    const questionValues = this.allQuestions().reduce<Record<string, number>>(
      (acc, q) => ({
        ...acc,
        [q.controlName]: raw[q.controlName] as number,
      }),
      {}
    ) as SurveyQuestionValues;

    const response: SurveyResponse = {
      sessionId: crypto.randomUUID(),
      uxMode: this.uxModeService.isPoorMode() ? 'poor' : 'good',
      submittedAt: new Date(),
      ...questionValues,
      openFeedback: raw['openFeedback'] as string,
      pagesTested: selectedPages,
    };

    try {
      await this.surveyRepository.save(response);
      this.submitSuccess.set(true);
      this.resetForm();
    } catch (err) {
      this.submitError.set(
        err instanceof Error ? err.message : 'Failed to submit survey. Please try again.'
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private resetForm(): void {
    for (const q of this.allQuestions()) {
      this.surveyForm.get(q.controlName)?.setValue(3);
    }
    this.surveyForm.patchValue({ openFeedback: '' });
    this.pagesTestedArray.controls.forEach((c) => c.setValue(false));
    this.surveyForm.markAsPristine();
    this.surveyForm.markAsUntouched();
  }
}
