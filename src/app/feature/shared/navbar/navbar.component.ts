import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UxModeService } from '../../../core/services/ux-mode.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  protected readonly uxModeService = inject(UxModeService);

  protected readonly navLinks = [
    { path: '/home', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/noticeboard', label: 'Noticeboard' },
    { path: '/local-info', label: 'Local Info' },
    { path: '/contact', label: 'Contact' },
  ];

  toggleUxMode(): void {
    this.uxModeService.toggleUxMode();
  }

  toggleDevMode(): void {
    this.uxModeService.toggleDevMode();
  }
}
