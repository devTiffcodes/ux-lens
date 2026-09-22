import { Component, inject, signal, computed, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Location, CommonModule } from '@angular/common';
import { SurveyRepository } from '../../../../data/repositories/survey.repository';
import { SurveyResponse, ClickEvent } from '../../../../domain/models/survey-response.model';
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const MERA_PAGES = ['home', 'events', 'noticeboard', 'courses', 'resources', 'profile'] as const;
type MeraPage = typeof MERA_PAGES[number];

interface SectionAverages {
  taskCompletion: number;
  cognitiveLoad: number;
  emotionalWellbeing: number;
  visualComfort: number;
  overall: number;
}

interface ModeAverages {
  count: number;
  sections: SectionAverages;
}

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results.component.html',
  styleUrl: './results.component.css',
})
export class ResultsComponent implements OnInit, AfterViewInit {
  private readonly surveyRepository = inject(SurveyRepository);
  private readonly location = inject(Location);

  @ViewChild('radarCanvas') radarCanvas!: ElementRef<HTMLCanvasElement>;

  // ── State ----------------------------------------------------------------

  protected readonly isLoading = signal<boolean>(true);
  protected readonly responses = signal<SurveyResponse[]>([]);
  protected readonly selectedPage = signal<MeraPage>('home');
  protected readonly selectedResponse = signal<SurveyResponse | null>(null);
  protected readonly activeTab = signal<'overview' | 'heatmap' | 'responses'>('overview');

  protected readonly meraPages = MERA_PAGES;

  private radarChart: Chart | null = null;
  private viewReady = false;
  private dataReady = false;

  // ── Computed -------------------------------------------------------------

  protected readonly goodModeAverages = computed(() =>
    this.calculateAverages(this.responses().filter((r) => r.uxMode === 'good'))
  );

  protected readonly poorModeAverages = computed(() =>
    this.calculateAverages(this.responses().filter((r) => r.uxMode === 'poor'))
  );

  protected readonly heatmapClicks = computed(() => {
    const page = `/mera/${this.selectedPage()}`;
    return this.responses().flatMap((r) =>
      (r.clickEvents ?? []).filter((c) => c.page === page)
    );
  });

  protected readonly taskCompletionRates = computed(() => {
    const good = this.responses().filter((r) => r.uxMode === 'good');
    const poor = this.responses().filter((r) => r.uxMode === 'poor');

    return ['task-1', 'task-2', 'task-3', 'task-4', 'task-5'].map((id, i) => ({
      label: `Task ${i + 1}`,
      goodRate: good.length ? good.filter((r) => (r.tasksCompleted ?? []).includes(id)).length / good.length * 100 : 0,
      poorRate: poor.length ? poor.filter((r) => (r.tasksCompleted ?? []).includes(id)).length / poor.length * 100 : 0,
    }));
  });

  // ── Lifecycle ------------------------------------------------------------

  async ngOnInit(): Promise<void> {
    await this.loadResponses();
    this.dataReady = true;
    this.tryBuildChart();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.tryBuildChart();
  }

  // ── Chart ----------------------------------------------------------------

  private tryBuildChart(): void {
    if (this.viewReady && this.dataReady) {
      setTimeout(() => this.buildRadarChart(), 200);
    }
  }

  private buildRadarChart(): void {
    if (!this.radarCanvas?.nativeElement) return;
    if (this.radarChart) this.radarChart.destroy();

    const good = this.goodModeAverages().sections;
    const poor = this.poorModeAverages().sections;

    this.radarChart = new Chart(this.radarCanvas.nativeElement, {
      type: 'radar',
      data: {
        labels: ['Task Completion', 'Cognitive Load', 'Emotional Wellbeing', 'Visual Comfort', 'Overall'],
        datasets: [
          {
            label: 'Good UX',
            data: [good.taskCompletion, good.cognitiveLoad, good.emotionalWellbeing, good.visualComfort, good.overall],
            backgroundColor: 'rgba(45, 106, 79, 0.15)',
            borderColor: '#2D6A4F',
            pointBackgroundColor: '#2D6A4F',
            borderWidth: 2,
          },
          {
            label: 'Poor UX',
            data: [poor.taskCompletion, poor.cognitiveLoad, poor.emotionalWellbeing, poor.visualComfort, poor.overall],
            backgroundColor: 'rgba(192, 57, 43, 0.12)',
            borderColor: '#C0392B',
            pointBackgroundColor: '#C0392B',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            min: 0,
            max: 5,
            ticks: { stepSize: 1, font: { size: 11 } },
            pointLabels: { font: { size: 12 } },
          },
        },
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
  }

  // ── Tabs -----------------------------------------------------------------

  protected setTab(tab: 'overview' | 'heatmap' | 'responses'): void {
    this.activeTab.set(tab);
    if (tab === 'overview') {
      setTimeout(() => this.buildRadarChart(), 200);
    }
  }

  // ── Heatmap -------------------------------------------------------------

  protected setPage(page: MeraPage): void {
    this.selectedPage.set(page);
  }

  protected heatmapStyle(click: ClickEvent): Record<string, string> {
    return {
      left: `${click.xPercent}%`,
      top: `${click.yPercent}%`,
    };
  }

  // ── Per-participant ------------------------------------------------------

  protected openResponse(r: SurveyResponse): void {
    this.selectedResponse.set(r);
  }

  protected closeResponse(): void {
    this.selectedResponse.set(null);
  }

  protected sectionScore(r: SurveyResponse, section: keyof SectionAverages): number {
    const avg = this.calculateAverages([r]);
    return avg.sections[section];
  }

  // ── CSV export ----------------------------------------------------------

  protected exportCsv(): void {
    const headers = [
      'sessionId', 'uxMode', 'submittedAt', 'sessionDurationSeconds',
      'tasksCompleted', 'taskEase', 'taskSuccess', 'taskFrustration',
      'cognitiveEffort', 'informationClarity', 'overwhelmed',
      'stressLevel', 'confidence', 'enjoyment',
      'visualClarity', 'eyeStrain', 'aestheticAppeal',
      'overallSatisfaction', 'wellbeingImpact',
      'pagesTested', 'openFeedback', 'totalClicks',
    ];

    const rows = this.responses().map((r) => [
      r.sessionId,
      r.uxMode,
      r.submittedAt instanceof Date ? r.submittedAt.toISOString() : String(r.submittedAt),
      r.sessionDurationSeconds ?? 0,
      (r.tasksCompleted ?? []).join(';'),
      r.taskEase, r.taskSuccess, r.taskFrustration,
      r.cognitiveEffort, r.informationClarity, r.overwhelmed,
      r.stressLevel, r.confidence, r.enjoyment,
      r.visualClarity, r.eyeStrain, r.aestheticAppeal,
      r.overallSatisfaction, r.wellbeingImpact,
      r.pagesTested.join(';'),
      `"${(r.openFeedback ?? '').replace(/"/g, '""')}"`,
      (r.clickEvents ?? []).length,
    ]);

    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ux-lens-results-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Helpers -------------------------------------------------------------

  protected goBack(): void {
    this.location.back();
  }

  protected isGoodClick(click: ClickEvent): boolean {
    return this.responses().some(
      (r) => r.uxMode === 'good' && (r.clickEvents ?? []).includes(click)
    );
  }

  private async loadResponses(): Promise<void> {
    this.isLoading.set(true);
    const responses = await this.surveyRepository.getAll();
    this.responses.set(responses);
    this.isLoading.set(false);
  }

  private safe(val: any): number {
    const n = Number(val);
    return isNaN(n) ? 3 : n;
  }

  private normalise(raw: number, reversed: boolean): number {
    return reversed ? 6 - raw : raw;
  }

  private sectionAvg(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private calculateAverages(responses: SurveyResponse[]): ModeAverages {
    const count = responses.length;
    if (count === 0) {
      return {
        count: 0,
        sections: { taskCompletion: 0, cognitiveLoad: 0, emotionalWellbeing: 0, visualComfort: 0, overall: 0 },
      };
    }

    const sums = responses.reduce(
      (acc, r) => ({
        taskCompletion: acc.taskCompletion + this.sectionAvg([
          this.normalise(this.safe(r.taskEase), false),
          this.normalise(this.safe(r.taskSuccess), false),
          this.normalise(this.safe(r.taskFrustration), true),
        ]),
        cognitiveLoad: acc.cognitiveLoad + this.sectionAvg([
          this.normalise(this.safe(r.cognitiveEffort), true),
          this.normalise(this.safe(r.informationClarity), false),
          this.normalise(this.safe(r.overwhelmed), true),
        ]),
        emotionalWellbeing: acc.emotionalWellbeing + this.sectionAvg([
          this.normalise(this.safe(r.stressLevel), true),
          this.normalise(this.safe(r.confidence), false),
          this.normalise(this.safe(r.enjoyment), false),
        ]),
        visualComfort: acc.visualComfort + this.sectionAvg([
          this.normalise(this.safe(r.visualClarity), false),
          this.normalise(this.safe(r.eyeStrain), true),
          this.normalise(this.safe(r.aestheticAppeal), false),
        ]),
        overall: acc.overall + this.sectionAvg([
          this.normalise(this.safe(r.overallSatisfaction), false),
          this.normalise(this.safe(r.wellbeingImpact), false),
        ]),
      }),
      { taskCompletion: 0, cognitiveLoad: 0, emotionalWellbeing: 0, visualComfort: 0, overall: 0 }
    );

    return {
      count,
      sections: {
        taskCompletion: sums.taskCompletion / count,
        cognitiveLoad: sums.cognitiveLoad / count,
        emotionalWellbeing: sums.emotionalWellbeing / count,
        visualComfort: sums.visualComfort / count,
        overall: sums.overall / count,
      },
    };
  }
}
