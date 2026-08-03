import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './feature/shared/navbar/navbar.component';
import { DevPanelComponent } from './feature/shared/dev-panel/dev-panel.component';
import { UxModeBannerComponent } from './feature/shared/ux-mode-banner/ux-mode-banner.component';
import { UxModeService } from './core/services/ux-mode.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NavbarComponent,
    DevPanelComponent,
    UxModeBannerComponent,],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ux-lens');
  protected readonly uxModeService = inject(UxModeService);
}

