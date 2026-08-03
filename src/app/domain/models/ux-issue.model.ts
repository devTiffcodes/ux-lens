export type IssueSeverity = | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export interface UxIssue {
  id: string;
  title: string;
  severity: IssueSeverity;
  description: string;
  principle: string;
  recommendation: string;
  affectedPage: string;
}
