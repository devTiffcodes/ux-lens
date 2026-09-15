import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { ClickEvent } from '../../../domain/models/survey-response.model';

@Injectable({ providedIn: 'root' })
export class SessionTrackingService implements OnDestroy {
  private readonly router = inject(Router);

  // ── State ----------------------------------------------------------------

  private sessionStart: number | null = null;
  private readonly _clickEvents = signal<ClickEvent[]>([]);
  private readonly _isTracking = signal<boolean>(false);

  private routerSub: Subscription | null = null;
  private clickListener: ((e: MouseEvent) => void) | null = null;

  // ── Public reads ---------------------------------------------------------

  readonly clickEvents = this._clickEvents.asReadonly();
  readonly isTracking = this._isTracking.asReadonly();

  // ── Lifecycle ------------------------------------------------------------

  constructor() {
    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        if (e.urlAfterRedirects.startsWith('/mera')) {
          if (!this._isTracking()) this.startSession();
        } else {
          if (this._isTracking()) this.pauseSession();
        }
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.removeClickListener();
  }

  // ── Session control ------------------------------------------------------

  startSession(): void {
    if (this._isTracking()) return;
    this.sessionStart = Date.now();
    this._isTracking.set(true);
    this.attachClickListener();
  }

  pauseSession(): void {
    this._isTracking.set(false);
    this.removeClickListener();
  }

  /** Call this on survey submit — returns duration in seconds */
  endSession(): number {
    this.pauseSession();
    if (this.sessionStart === null) return 0;
    return Math.round((Date.now() - this.sessionStart) / 1000);
  }

  /** Call this when participant switches UX mode so data stays separate */
  resetSession(): void {
    this.pauseSession();
    this.sessionStart = null;
    this._clickEvents.set([]);
  }

  // ── Click recording ------------------------------------------------------

  private attachClickListener(): void {
    this.removeClickListener(); // guard against double attach
    this.clickListener = (e: MouseEvent) => this.recordClick(e);
    document.addEventListener('click', this.clickListener, { capture: true });
  }

  private removeClickListener(): void {
    if (this.clickListener) {
      document.removeEventListener('click', this.clickListener, { capture: true });
      this.clickListener = null;
    }
  }

  private recordClick(e: MouseEvent): void {
    if (!this._isTracking()) return;

    const target = e.target as HTMLElement;
    const xPercent = parseFloat(((e.clientX / window.innerWidth) * 100).toFixed(2));
    const yPercent = parseFloat(((e.clientY / window.innerHeight) * 100).toFixed(2));

    const event: ClickEvent = {
      x: e.clientX,
      y: e.clientY,
      xPercent,
      yPercent,
      target: this.describeTarget(target),
      page: this.router.url.split('?')[0], // strip query params
      timestamp: this.sessionStart ? Date.now() - this.sessionStart : 0,
    };

    this._clickEvents.update((prev) => [...prev, event]);
  }

  /** Builds a readable CSS-selector-style string for the clicked element */
  private describeTarget(el: HTMLElement): string {
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : '';
    const classes = el.classList.length
      ? '.' + Array.from(el.classList).slice(0, 2).join('.')
      : '';
    const text = el.textContent?.trim().slice(0, 20) ?? '';
    return `${tag}${id}${classes}${text ? ` "${text}"` : ''}`;
  }
}
