import { Component, inject, signal, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { UxModeService } from '../../../core/services/ux-mode.service';
import { UxAnalysisRepository } from '../../../data/repositories/ux-analysis.repository';
import { ClaudeService } from '../../../data/services/claude.service';
import { UxIssue } from '../../../domain/models/ux-issue.model';

@Component({
  selector: 'app-dev-panel',
  standalone: true,
  imports: [],
  templateUrl: './dev-panel.component.html',
  styleUrl: './dev-panel.component.css',
})
export class DevPanelComponent {
  protected readonly uxModeService = inject(UxModeService);
  private readonly uxAnalysisRepository = inject(UxAnalysisRepository);
  protected readonly claudeService = inject(ClaudeService);
  private readonly router = inject(Router);

  protected readonly issues = signal<UxIssue[]>([]);
  protected readonly wellbeingScore = signal<number>(100);
  protected readonly mentorQuestion = signal<string>('');

  private readonly currentPageSlug = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => this.extractPageSlug((event as NavigationEnd).urlAfterRedirects)),
      startWith(this.extractPageSlug(this.router.url))
    ),
    { initialValue: this.extractPageSlug(this.router.url) }
  );

  constructor() {
    effect(() => {
      const pageSlug = this.currentPageSlug();
      const mode = this.uxModeService.isPoorMode() ? 'poor' : 'good';
      this.loadAnalysis(pageSlug, mode);
    });
  }

  private extractPageSlug(url: string): string {
    const cleaned = url.split('?')[0].split('/').filter(Boolean);
    return cleaned[0] ?? 'home';
  }

  private async loadAnalysis(pageSlug: string, mode: 'good' | 'poor'): Promise<void> {
    const [issues, score] = await Promise.all([
      this.uxAnalysisRepository.getIssuesForPage(pageSlug, mode),
      this.uxAnalysisRepository.getWellbeingScore(pageSlug, mode),
    ]);
    this.issues.set(issues);
    this.wellbeingScore.set(score);
  }

  protected closePanel(): void {
    this.uxModeService.toggleDevMode();
  }

  protected async askMentor(): Promise<void> {
    const pageSlug = this.currentPageSlug();
    const mode = this.uxModeService.isPoorMode() ? 'poor' : 'good';

    await this.claudeService.getMentorFeedback({
      pageName: pageSlug,
      uxMode: mode,
      issues: this.issues(),
      wellbeingScore: this.wellbeingScore(),
      userQuestion: this.mentorQuestion(),
    });

    this.mentorQuestion.set('');
  }

  protected onMentorInput(event: Event): void {
    this.mentorQuestion.set((event.target as HTMLTextAreaElement).value);
  }

  protected severityClass(severity: string): string {
    return `severity-${severity}`;
  }
}
