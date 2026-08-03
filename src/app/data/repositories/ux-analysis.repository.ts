import { Injectable } from '@angular/core';
import { IUxAnalysisRepository } from '../../domain/interfaces/iux-analysis.repository';
import { UxIssue, IssueSeverity } from '../../domain/models/ux-issue.model';
import { UxMode } from '../../domain/models/ux-mode.model';

/**
 * Static catalogue of UX issues per page, per mode.
 *
 * These are authored content (deliberate design flaws you've built into
 * Mera's "poor" mode for the research), not user-generated data — so they
 * live in code rather than Firestore. If this grows large, split it into
 * its own data file (e.g. ux-issues.data.ts) and import it here.
 */
const UX_ISSUES_DATABASE: UxIssue[] = [
  {
    id: 'home-poor-01',
    title: 'Low-contrast body text',
    severity: 'medium',
    description:
      'Body text uses a light grey on a white background, making it hard to read, especially for users with low vision.',
    principle: 'WCAG 2.1 — Contrast Minimum (1.4.3)',
    recommendation:
      'Increase text-to-background contrast ratio to at least 4.5:1.',
    affectedPage: 'home',
  },
  {
    id: 'home-poor-02',
    title: 'No visible focus states',
    severity: 'high',
    description:
      'Interactive elements have no visible outline or highlight when navigated via keyboard, breaking accessibility for keyboard-only users.',
    principle: "Nielsen's Heuristic #1 — Visibility of System Status",
    recommendation:
      'Add a clear :focus-visible style to all interactive elements.',
    affectedPage: 'home',
  },
  {
    id: 'events-poor-01',
    title: 'Ambiguous date formatting',
    severity: 'medium',
    description:
      'Event dates are shown as unlabelled numbers (e.g. "03/04"), which is ambiguous between day-first and month-first formats.',
    principle: "Nielsen's Heuristic #4 — Consistency and Standards",
    recommendation:
      'Use an unambiguous format, e.g. "4 Mar 2026", consistently across the app.',
    affectedPage: 'events',
  },
  {
    id: 'noticeboard-poor-01',
    title: 'No empty or loading state',
    severity: 'low',
    description:
      'When there are no notices, the page shows a blank area with no explanation, leaving users unsure if something failed to load.',
    principle: "Nielsen's Heuristic #1 — Visibility of System Status",
    recommendation:
      'Add an explicit empty-state message and a loading skeleton/spinner.',
    affectedPage: 'noticeboard',
  },
  {
    id: 'local-info-poor-01',
    title: 'Unlabelled icon-only navigation',
    severity: 'high',
    description:
      'Category links are represented only by icons with no text labels, forcing users to guess their meaning.',
    principle: "Nielsen's Heuristic #6 — Recognition Rather Than Recall",
    recommendation: 'Pair every icon with a visible text label.',
    affectedPage: 'local-info',
  },
  {
    id: 'contact-poor-01',
    title: 'No form validation feedback',
    severity: 'critical',
    description:
      'Submitting the contact form with missing/invalid fields gives no error messages, so the user cannot tell why submission failed.',
    principle: "Nielsen's Heuristic #9 — Help Users Recognize and Recover from Errors",
    recommendation:
      'Show inline validation messages next to each invalid field before and after submission.',
    affectedPage: 'contact',
  },
];

/** Point deducted from a page's wellbeing score per issue, by severity. */
const SEVERITY_WEIGHT: Record<IssueSeverity, number> = {
  low: 5,
  medium: 10,
  high: 20,
  critical: 35,
};

const MAX_SCORE = 100;
const MIN_SCORE = 0;

@Injectable({
  providedIn: 'root',
})
export class UxAnalysisRepository implements IUxAnalysisRepository {
  /**
   * Returns the UX issues affecting a given page. In "good" mode, Mera is
   * assumed not to exhibit these issues, so an empty list is returned —
   * adjust this if you want a few minor issues to persist in good mode too.
   */
  async getIssuesForPage(pageName: string, uxMode: UxMode): Promise<UxIssue[]> {
    if (uxMode === 'good') {
      return [];
    }

    return UX_ISSUES_DATABASE.filter(
      (issue) => issue.affectedPage === pageName
    );
  }

  /**
   * Computes a 0-100 wellbeing score for a page based on the severity of
   * its issues. Good mode always scores at the max.
   */
  async getWellbeingScore(pageName: string, uxMode: UxMode): Promise<number> {
    if (uxMode === 'good') {
      return MAX_SCORE;
    }

    const issues = await this.getIssuesForPage(pageName, uxMode);
    const totalDeduction = issues.reduce(
      (sum, issue) => sum + SEVERITY_WEIGHT[issue.severity],
      0
    );

    return Math.max(MIN_SCORE, MAX_SCORE - totalDeduction);
  }
}
