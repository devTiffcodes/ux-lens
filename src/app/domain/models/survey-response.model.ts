export interface SurveyResponse {
  id?: string;
  sessionId: string;
  uxMode: 'good' | 'poor';
  submittedAt: Date;
  stressLevel: number;
  easeOfUse: number;
  overwhelmed: number;
  satisfactionScore: number;
  openFeedback: string;
  pagesTested: string[];
}
