import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SurveyRepository } from '../../../../data/repositories/survey.repository';
import { SurveyResponse } from '../../../../domain/models/survey-response.model';
import { AuthService } from '../../../../core/services/auth.service';

interface SectionAverages {
  taskCompletion: number;
  cognitiveLoad: number;
  emotionalWellbeing: number;
  visualComfort: number;
  overall: number;
}

interface ModeAverages {
  count: number;
  sections: SectionAverages;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private readonly surveyRepository = inject(SurveyRepository);
  protected readonly authService = inject(AuthService);

  protected readonly isLoading = signal<boolean>(true);
  protected readonly responses = signal<SurveyResponse[]>([]);

  protected readonly goodModeAverages = computed(() =>
    this.calculateAverages(this.responses().filter((r) => r.uxMode === 'good'))
  );

  protected readonly poorModeAverages = computed(() =>
    this.calculateAverages(this.responses().filter((r) => r.uxMode === 'poor'))
  );

  protected readonly totalResponses = computed(() => this.responses().length);
  protected readonly goodCount = computed(() => this.responses().filter(r => r.uxMode === 'good').length);
  protected readonly poorCount = computed(() => this.responses().filter(r => r.uxMode === 'poor').length);

  constructor() {
    this.loadResponses();
  }

  private async loadResponses(): Promise<void> {
    this.isLoading.set(true);
    const responses = await this.surveyRepository.getAll();
    this.responses.set(responses);
    this.isLoading.set(false);
  }

  // Reversed fields: high score = negative outcome.
  // We invert them so all section scores read as "higher = better".
  private normalise(raw: number, reversed: boolean): number {
    return reversed ? 6 - raw : raw;
  }

  private sectionAvg(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private calculateAverages(responses: SurveyResponse[]): ModeAverages {
    const count = responses.length;
    if (count === 0) {
      return {
        count: 0,
        sections: { taskCompletion: 0, cognitiveLoad: 0, emotionalWellbeing: 0, visualComfort: 0, overall: 0 },
      };
    }

    const sums = responses.reduce(
      (acc, r) => ({
        taskCompletion: acc.taskCompletion + this.sectionAvg([
          this.normalise(r.taskEase, false),
          this.normalise(r.taskSuccess, false),
          this.normalise(r.taskFrustration, true),
        ]),
        cognitiveLoad: acc.cognitiveLoad + this.sectionAvg([
          this.normalise(r.cognitiveEffort, true),
          this.normalise(r.informationClarity, false),
          this.normalise(r.overwhelmed, true),
        ]),
        emotionalWellbeing: acc.emotionalWellbeing + this.sectionAvg([
          this.normalise(r.stressLevel, true),
          this.normalise(r.confidence, false),
          this.normalise(r.enjoyment, false),
        ]),
        visualComfort: acc.visualComfort + this.sectionAvg([
          this.normalise(r.visualClarity, false),
          this.normalise(r.eyeStrain, true),
          this.normalise(r.aestheticAppeal, false),
        ]),
        overall: acc.overall + this.sectionAvg([
          this.normalise(r.overallSatisfaction, false),
          this.normalise(r.wellbeingImpact, true),
        ]),
      }),
      { taskCompletion: 0, cognitiveLoad: 0, emotionalWellbeing: 0, visualComfort: 0, overall: 0 }
    );

    return {
      count,
      sections: {
        taskCompletion: sums.taskCompletion / count,
        cognitiveLoad: sums.cognitiveLoad / count,
        emotionalWellbeing: sums.emotionalWellbeing / count,
        visualComfort: sums.visualComfort / count,
        overall: sums.overall / count,
      },
    };
  }
}
