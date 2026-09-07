import { Component, signal, inject, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { UxLensFabComponent } from './feature/pages/ux-lens-fab/ux-lens-fab.component';
import { NavbarComponent } from './feature/shared/navbar/navbar.component';
import { UxLensNavbarComponent } from './feature/shared/ux-lens-navbar/ux-lens-navbar.component';
import { DevPanelComponent } from './feature/shared/dev-panel/dev-panel.component';
import { UxModeBannerComponent } from './feature/shared/ux-mode-banner/ux-mode-banner.component';
import { UxModeService } from './core/services/ux-mode.service';
import { AuthService } from './core/services/auth.service';
import { FooterComponent } from './feature/shared/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FooterComponent,
    RouterOutlet,
    NavbarComponent,
    UxLensNavbarComponent,
    DevPanelComponent,
    UxModeBannerComponent,
    UxLensFabComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ux-lens');
  protected readonly uxModeService = inject(UxModeService);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  protected readonly isMeraRoute = computed(() =>
    this.currentUrl().startsWith('/mera')
  );
}
