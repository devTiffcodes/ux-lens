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
        wellbeingScore: Math.round(
          response.scores.accessibility * 0.4 +
          response.scores.bestPractices * 0.25 +
          response.scores.seo * 0.2 +
          response.scores.performance * 0.15
        ),
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

  private mapAuditToUxIssue(audit: LighthouseAudit, pageUrl: string): UxIssue {
    return {
      id: audit.id,
      title: audit.title,
      severity: this.deriveSeverity(audit.score),
      description: this.stripMarkdownLinks(audit.description),
      principle: this.mapAuditToPrinciple(audit.id),
      recommendation: this.stripMarkdownLinks(audit.description),
      affectedPage: pageUrl,
    };
  }

  private mapAuditToPrinciple(auditId: string): string {
    const map: Record<string, string> = {
      'color-contrast': 'Aesthetic-Usability Effect / WCAG Contrast',
      'image-alt': 'Law of Prägnanz / WCAG Alt Text',
      'button-name': "Fitts's Law / WCAG Button Labels",
      'link-name': 'Selective Attention / WCAG Link Labels',
      'document-title': "Jakob's Law / WCAG Document Title",
      'html-has-lang': 'Postel\'s Law / WCAG Language',
      'meta-description': 'Selective Attention / SEO Meta Description',
      'font-size': 'Cognitive Load / Readability',
      'tap-targets': "Fitts's Law / Touch Target Size",
      'uses-text-compression': 'Doherty Threshold / Performance',
      'speed-index': 'Doherty Threshold / Perceived Performance',
      'first-contentful-paint': 'Doherty Threshold / First Paint',
      'interactive': 'Doherty Threshold / Time to Interactive',
      'largest-contentful-paint': 'Doherty Threshold / Largest Paint',
      'total-blocking-time': 'Cognitive Load / Blocked Interactivity',
      'cumulative-layout-shift': 'Jakob\'s Law / Layout Stability',
      'uses-optimized-images': 'Doherty Threshold / Image Performance',
      'render-blocking-resources': 'Doherty Threshold / Render Blocking',
      'unused-css-rules': 'Occam\'s Razor / Unused CSS',
      'unused-javascript': 'Occam\'s Razor / Unused JavaScript',
      'uses-responsive-images': 'Cognitive Load / Responsive Images',
      'efficient-animated-content': 'Aesthetic-Usability Effect / Animation',
      'aria-allowed-attr': 'Postel\'s Law / ARIA Attributes',
      'aria-required-attr': 'Postel\'s Law / ARIA Required',
      'aria-roles': 'Mental Model / ARIA Roles',
      'aria-valid-attr': 'Postel\'s Law / ARIA Validity',
      'duplicate-id-active': 'Law of Uniform Connectedness / Duplicate IDs',
      'form-field-multiple-labels': 'Cognitive Load / Form Labels',
      'frame-title': 'Selective Attention / Frame Titles',
      'heading-order': 'Serial Position Effect / Heading Hierarchy',
      'label': 'Cognitive Load / Form Labels',
      'list': 'Law of Proximity / List Structure',
      'listitem': 'Law of Proximity / List Items',
      'tabindex': "Fitts's Law / Tab Order",
      'td-headers-attr': 'Cognitive Load / Table Headers',
      'th-has-data-cells': 'Cognitive Load / Table Data',
      'valid-lang': 'Mental Model / Language Attribute',
      'video-caption': 'Selective Attention / Video Captions',
    };
    return map[auditId] ?? 'WCAG / Lighthouse Audit';
  }

  private deriveSeverity(score: number | null): IssueSeverity {
    if (score === null) return 'medium';
    if (score === 0) return 'critical';
    if (score < 0.5) return 'high';
    return 'medium';
  }

  private stripMarkdownLinks(text: string): string {
    return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  }
}
