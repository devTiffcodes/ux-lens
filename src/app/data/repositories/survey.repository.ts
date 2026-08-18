import { Injectable, inject } from '@angular/core';
import { where, orderBy } from 'firebase/firestore';
import { FirebaseService } from '../services/firebase.service';
import { ISurveyRepository } from '../../domain/interfaces/isurvey.repository';
import { SurveyResponse } from '../../domain/models/survey-response.model';
import { UxMode } from '../../domain/models/ux-mode.model';

const SURVEY_COLLECTION = 'surveyResponses';

/**
 * SurveyRepository
 *
 * Concrete Firestore implementation of ISurveyRepository. Depends only on
 * FirebaseService's generic helpers — no direct Firestore SDK calls beyond
 * building query constraints, keeping the repository swappable if the
 * persistence layer ever changes.
 */
@Injectable({
  providedIn: 'root',
})
export class SurveyRepository implements ISurveyRepository {
  private readonly firebaseService = inject(FirebaseService);

  async save(response: SurveyResponse): Promise<string> {
    return this.firebaseService.addDocument<SurveyResponse>(
      SURVEY_COLLECTION,
      response
    );
  }

  async getAll(): Promise<SurveyResponse[]> {
    return this.firebaseService.getDocuments<SurveyResponse>(
      SURVEY_COLLECTION,
      [orderBy('submittedAt', 'desc')]
    );
  }

  async getByMode(uxMode: UxMode): Promise<SurveyResponse[]> {
    return this.firebaseService.getDocuments<SurveyResponse>(
      SURVEY_COLLECTION,
      [where('uxMode', '==', uxMode), orderBy('submittedAt', 'desc')]
    );
  }
}
