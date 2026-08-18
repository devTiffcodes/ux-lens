import { UxMode } from '../models/ux-mode.model';
import { UxIssue } from '../models/ux-issue.model';

export interface IUxAnalysisRepository {
  getIssuesForPage(page: string, mode: UxMode): Promise<UxIssue[]>;
  getWellbeingScore(page: string, mode: UxMode): Promise<number>;
}
