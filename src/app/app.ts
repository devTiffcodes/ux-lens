import { Component, signal, inject, computed } from '@angular/core';
import {
  RouterOutlet,
  Router,
  NavigationEnd,
  RouterLink,
  RouterLinkActive
} from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

import { UxLensFabComponent } from './feature/pages/ux-lens/ux-lens-fab/ux-lens-fab.component';
import { NavbarComponent } from './feature/shared/navbar/navbar.component';
import { UxLensNavbarComponent } from './feature/shared/ux-lens-navbar/ux-lens-navbar.component';
import { DevPanelComponent } from './feature/shared/dev-panel/dev-panel.component';
import { UxModeBannerComponent } from './feature/shared/ux-mode-banner/ux-mode-banner.component';
import { UxModeService } from './core/services/ux-mode.service';
import { AuthService } from './core/services/auth.service';
import { FooterComponent } from './feature/shared/footer/footer.component';
import { StudyTasksComponent } from './feature/pages/mera/study-tasks/study-tasks.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FooterComponent,
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
    NavbarComponent,
    UxLensNavbarComponent,
    DevPanelComponent,
    UxModeBannerComponent,
    UxLensFabComponent,
    StudyTasksComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ux-lens');

  protected readonly uxModeService = inject(UxModeService);
  protected readonly authService = inject(AuthService);

  private readonly router = inject(Router);

  // ── Global UX Lens sidebar ───────────────────────────────────────
  protected readonly sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update(open => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  // ── Current route ────────────────────────────────────────────────
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
