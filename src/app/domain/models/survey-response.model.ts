export interface SurveyResponse {
  id?: string;
  sessionId: string;
  uxMode: 'good' | 'poor';
  submittedAt: Date;

  // Section 1: Task Completion
  taskEase: number;
  taskSuccess: number;
  taskFrustration: number; // reversed

  // Section 2: Cognitive Load
  cognitiveEffort: number; // reversed
  informationClarity: number;
  overwhelmed: number; // reversed

  // Section 3: Emotional Wellbeing
  stressLevel: number; // reversed
  confidence: number;
  enjoyment: number;

  // Section 4: Visual Comfort
  visualClarity: number;
  eyeStrain: number; // reversed
  aestheticAppeal: number;

  // Section 5: Overall
  overallSatisfaction: number;
  wellbeingImpact: number; // reversed

  pagesTested: string[];
  openFeedback: string;
}
