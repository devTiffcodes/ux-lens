import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UxIssue, IssueSeverity } from '../../domain/models/ux-issue.model';

interface LighthouseAudit {
  id: string;
  title: string;
  description: string;
  score: number | null;
  scoreDisplayMode: string;
  displayValue?: string;
}

interface AnalyzeSiteResponse {
  url: string;
  fetchedAt: string;
  scores: {
    accessibility: number;
    bestPractices: number;
    seo: number;
    performance: number;
  };
  failingAudits: LighthouseAudit[];
}

export interface SiteAnalysisResult {
  url: string;
  fetchedAt: string;
  scores: AnalyzeSiteResponse['scores'];
  issues: UxIssue[];
  wellbeingScore: number;
}

/**
 * SiteAnalyzerService
 *
 * Calls the /api/analyze-site serverless function (Google PageSpeed
 * Insights/Lighthouse under the hood) and maps its raw audit output into
 * this app's own UxIssue shape, so the Site Analyzer page can reuse the
 * exact same issue-card UI already built for Mera's mock issues.
 */
@Injectable({
  providedIn: 'root',
})
export class SiteAnalyzerService {
  private readonly http = inject(HttpClient);

  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly result = signal<SiteAnalysisResult | null>(null);

  async analyzeUrl(url: string): Promise<SiteAnalysisResult> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<AnalyzeSiteResponse>('/api/analyze-site', { url })
      );

      const issues = response.failingAudits.map((audit) =>
        this.mapAuditToUxIssue(audit, response.url)
      );

      const result: SiteAnalysisResult = {
        url: response.url,
        fetchedAt: response.fetchedAt,
        scores: response.scores,
        issues,
        wellbeingScore: response.scores.accessibility,
      };

      this.result.set(result);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to analyze this URL.';
      this.error.set(message);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  reset(): void {
    this.result.set(null);
    this.error.set(null);
  }

  /**
   * Maps a Lighthouse accessibility audit failure into this app's UxIssue
   * shape. Lighthouse doesn't provide a severity level directly, so we
   * derive one from its score (0 = total failure, closer to 1 = minor).
   */
  private mapAuditToUxIssue(audit: LighthouseAudit, pageUrl: string): UxIssue {
    return {
      id: audit.id,
      title: audit.title,
      severity: this.deriveSeverity(audit.score),
      description: this.stripMarkdownLinks(audit.description),
      principle: 'WCAG / Lighthouse Accessibility Audit',
      recommendation: this.stripMarkdownLinks(audit.description),
      affectedPage: pageUrl,
    };
  }

  private deriveSeverity(score: number | null): IssueSeverity {
    if (score === null) {
      return 'medium';
    }
    if (score === 0) {
      return 'critical';
    }
    if (score < 0.5) {
      return 'high';
    }
    return 'medium';
  }

  /**
   * Lighthouse audit descriptions contain Markdown-style links like
   * "[Learn more](https://...)". We strip the link syntax down to plain
   * text so it renders cleanly in the existing issue-card template, which
   * expects plain strings, not Markdown.
   */
  private stripMarkdownLinks(text: string): string {
    return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  }
}
