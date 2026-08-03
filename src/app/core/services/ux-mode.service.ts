import { Injectable, signal, computed, Renderer2, RendererFactory2, effect } from '@angular/core';
import { UxMode, UX_MODE_CONFIGS, UxModeConfig } from '../../domain/models/ux-mode.model';

@Injectable({
  providedIn: 'root'
})

export class UxModeService {
  private _mode = signal<UxMode>('good');
  private _devModeActive = signal<boolean>(false);

  private readonly renderer: Renderer2;

  readonly mode = this._mode.asReadonly();
  readonly devModeActive = this._devModeActive.asReadonly();

  readonly config = computed<UxModeConfig>(() =>
    UX_MODE_CONFIGS[this._mode()]
  );

  readonly isGoodMode = computed(() => this._mode() === 'good');
  readonly isPoorMode = computed(() => this._mode() === 'poor');

  toggleUxMode(): void {
    this._mode.set(this._mode() === 'good' ? 'poor' : 'good');
  }

  setMode(mode: UxMode): void {
    this._mode.set(mode);
  }

  toggleDevMode(): void {
    this._devModeActive.set(!this._devModeActive());
  }


  constructor(rendererFactory: RendererFactory2 /* , your existing injected deps */) {
    this.renderer = rendererFactory.createRenderer(null, null);

    effect(() => {
      if (this.isPoorMode()) {
        this.renderer.addClass(document.documentElement, 'poor-ux');
      } else {
        this.renderer.removeClass(document.documentElement, 'poor-ux');
      }
    });
  }
}
