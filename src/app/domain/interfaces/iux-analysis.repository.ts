import { UxMode } from '../models/ux-mode.model';

export interface IUxAnalysisRepository {
  getIssuesForPage(page: string, mode: UxMode): Promise<UxIssue[]>;
  getWellbeingScore(page: string, mode: UxMode): Promise<number>;
}
