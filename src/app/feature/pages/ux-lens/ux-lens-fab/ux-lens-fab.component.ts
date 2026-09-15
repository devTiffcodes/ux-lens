import { Component, inject, signal, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UxModeService } from '../../../../core/services/ux-mode.service';
import { SessionTrackingService } from '../../../../core/services/mera/session-tracking.service';
import { ClickEvent } from '../../../../domain/models/survey-response.model';

@Component({
  selector: 'app-ux-lens-fab',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './ux-lens-fab.component.html',
  styleUrl: './ux-lens-fab.component.css',
})
export class UxLensFabComponent implements AfterViewInit, OnDestroy {
  protected readonly uxModeService = inject(UxModeService);
  protected readonly sessionTracking = inject(SessionTrackingService);

  protected readonly isOpen = signal<boolean>(false);
  protected readonly showHeatmap = signal<boolean>(false);

  @ViewChild('heatmapCanvas') heatmapCanvas!: ElementRef<HTMLCanvasElement>;

  private animFrame: number | null = null;
  private lastClickCount = 0;

  // ── Lifecycle ------------------------------------------------------------

  ngAfterViewInit(): void {
    // nothing to init until heatmap is toggled on
  }

  ngOnDestroy(): void {
    this.stopRender();
  }

  // ── Panel ----------------------------------------------------------------

  protected togglePanel(): void {
    this.isOpen.set(!this.isOpen());
    if (!this.isOpen()) {
      this.showHeatmap.set(false);
      this.stopRender();
    }
  }

  protected toggleMode(): void {
    this.uxModeService.toggleUxMode();
  }

  protected toggleDev(): void {
    this.uxModeService.toggleDevMode();
  }

  // ── Heatmap -------------------------------------------------------------

  protected toggleHeatmap(): void {
    const next = !this.showHeatmap();
    this.showHeatmap.set(next);
    if (next) {
      // Wait a tick for the canvas to render
      setTimeout(() => this.startRender(), 50);
    } else {
      this.stopRender();
    }
  }

  protected clearHeatmap(): void {
    this.sessionTracking.resetSession();
    this.sessionTracking.startSession();
    this.clearCanvas();
  }

  private startRender(): void {
    this.stopRender();
    const render = () => {
      const clicks = this.sessionTracking.clickEvents();
      if (clicks.length !== this.lastClickCount) {
        this.lastClickCount = clicks.length;
        this.drawHeatmap(clicks);
      }
      this.animFrame = requestAnimationFrame(render);
    };
    this.animFrame = requestAnimationFrame(render);
  }

  private stopRender(): void {
    if (this.animFrame !== null) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
  }

  private drawHeatmap(clicks: readonly ClickEvent[]): void {
    const canvas = this.heatmapCanvas?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const click of clicks) {
      const x = (click.xPercent / 100) * canvas.width;
      const y = (click.yPercent / 100) * canvas.height;
      const isGood = !this.uxModeService.isPoorMode();

      // Outer glow
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 40);
      glow.addColorStop(0, isGood ? 'rgba(45,106,79,0.25)' : 'rgba(192,57,43,0.25)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(x, y, 40, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Core dot
      const dot = ctx.createRadialGradient(x, y, 0, x, y, 8);
      dot.addColorStop(0, isGood ? 'rgba(45,106,79,0.9)' : 'rgba(192,57,43,0.9)');
      dot.addColorStop(1, isGood ? 'rgba(45,106,79,0)' : 'rgba(192,57,43,0)');
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = dot;
      ctx.fill();
    }
  }

  private clearCanvas(): void {
    const canvas = this.heatmapCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.lastClickCount = 0;
  }

  protected get clickCount(): number {
    return this.sessionTracking.clickEvents().length;
  }
}
