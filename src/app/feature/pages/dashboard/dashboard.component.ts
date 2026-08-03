import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SurveyRepository } from '../../../data/repositories/survey.repository';
import { SurveyResponse } from '../../../domain/models/survey-response.model';
import { FirebaseService } from '../../../data/services/firebase.service';

interface ModeAverages {
  count: number;
  stress: number;
  ease: number;
  overwhelmed: number;
  satisfaction: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private readonly surveyRepository = inject(SurveyRepository);
  private readonly firebaseService = inject(FirebaseService);
  private readonly router = inject(Router);

  protected readonly isLoading = signal<boolean>(true);
  protected readonly responses = signal<SurveyResponse[]>([]);

  protected readonly goodModeAverages = computed(() =>
    this.calculateAverages(this.responses().filter((r) => r.uxMode === 'good'))
  );

  protected readonly poorModeAverages = computed(() =>
    this.calculateAverages(this.responses().filter((r) => r.uxMode === 'poor'))
  );

  constructor() {
    this.loadResponses();
  }

  private async loadResponses(): Promise<void> {
    this.isLoading.set(true);
    const responses = await this.surveyRepository.getAll();
    this.responses.set(responses);
    this.isLoading.set(false);
  }

  private calculateAverages(responses: SurveyResponse[]): ModeAverages {
    const count = responses.length;
    if (count === 0) {
      return { count: 0, stress: 0, ease: 0, overwhelmed: 0, satisfaction: 0 };
    }

    const sum = responses.reduce(
      (acc, r) => ({
        stress: acc.stress + r.stress,
        ease: acc.ease + r.ease,
        overwhelmed: acc.overwhelmed + r.overwhelmed,
        satisfaction: acc.satisfaction + r.satisfaction,
      }),
      { stress: 0, ease: 0, overwhelmed: 0, satisfaction: 0 }
    );

    return {
      count,
      stress: sum.stress / count,
      ease: sum.ease / count,
      overwhelmed: sum.overwhelmed / count,
      satisfaction: sum.satisfaction / count,
    };
  }

  protected async logout(): Promise<void> {
    await this.firebaseService.signOut();
    this.router.navigate(['/home']);
  }
}
