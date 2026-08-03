import { SurveyResponse } from '../models/survey-response.model';

export interface ISurveyRepository {
  save(response: SurveyResponse): Promise<string>;
  getAll(): Promise<SurveyResponse[]>;
  getByMode(mode: 'good' | 'poor'): Promise<SurveyResponse[]>;
}
