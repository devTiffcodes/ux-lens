export interface ClickEvent {
  x: number;
  y: number;
  xPercent: number;
  yPercent: number;
  target: string;       // e.g. 'button.nav-link', 'a.course-card'
  page: string;         // e.g. '/mera/home'
  timestamp: number;    // ms since session start
}

export interface SurveyResponse {
  id?: string;
  sessionId: string;
  uxMode: 'good' | 'poor';
  submittedAt: Date;

  // Session tracking
  sessionDurationSeconds: number;
  tasksCompleted: string[];         // task IDs the participant marked complete
  clickEvents: ClickEvent[];        // full click log for heatmap

  // Section 1: Task Completion
  taskEase: number;
  taskSuccess: number;
  taskFrustration: number;          // reversed

  // Section 2: Cognitive Load
  cognitiveEffort: number;          // reversed
  informationClarity: number;
  overwhelmed: number;              // reversed

  // Section 3: Emotional Wellbeing
  stressLevel: number;              // reversed
  confidence: number;
  enjoyment: number;

  // Section 4: Visual Comfort
  visualClarity: number;
  eyeStrain: number;                // reversed
  aestheticAppeal: number;

  // Section 5: Overall
  overallSatisfaction: number;
  wellbeingImpact: number;          // reversed

  pagesTested: string[];
  openFeedback: string;
}
