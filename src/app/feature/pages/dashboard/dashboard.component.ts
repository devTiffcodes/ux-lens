import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SurveyRepository } from '../../../data/repositories/survey.repository';
import { SurveyResponse } from '../../../domain/models/survey-response.model';
import { FirebaseService } from '../../../data/services/firebase.service';

interface ModeAverages {
  count: number;
  stressLevel: number;
  easeOfUse: number;
  overwhelmed: number;
  satisfactionScore: number;
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
      return { count: 0, stressLevel: 0, easeOfUse: 0, overwhelmed: 0, satisfactionScore: 0 };
    }

    const sum = responses.reduce(
      (acc, r) => ({
        stressLevel: acc.stressLevel + r.stressLevel,
        easeOfUse: acc.easeOfUse + r.easeOfUse,
        overwhelmed: acc.overwhelmed + r.overwhelmed,
        satisfactionScore: acc.satisfactionScore + r.satisfactionScore,
      }),
      { stressLevel: 0, easeOfUse: 0, overwhelmed: 0, satisfactionScore: 0 }
    );

    return {
      count,
      stressLevel: sum.stressLevel / count,
      easeOfUse: sum.easeOfUse / count,
      overwhelmed: sum.overwhelmed / count,
      satisfactionScore: sum.satisfactionScore / count,
    };
  }

  protected async logout(): Promise<void> {
    await this.firebaseService.signOut();
    this.router.navigate(['/home']);
  }
}
