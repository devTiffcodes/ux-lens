import { Component, inject, signal, HostListener, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UxModeService } from '../../../core/services/ux-mode.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  protected readonly uxModeService = inject(UxModeService);
  protected readonly authService = inject(AuthService);
  protected readonly toolsOpen = signal<boolean>(false);

  protected readonly navLinks = [
    { path: '/mera/home', label: 'Home' },
    { path: '/mera/events', label: 'Events' },
    { path: '/mera/noticeboard', label: 'Noticeboard' },
    { path: '/mera/local-info', label: 'Local Info' },
    { path: '/mera/contact', label: 'Contact' },
  ];

  protected readonly toolLinks = [
    { path: '/guidelines', label: 'Guidelines' },
    { path: '/site-analyzer', label: 'Site Analyzer' },
    { path: '/dashboard', label: 'Dashboard' },
  ];

  protected toggleUxMode(): void {
    this.uxModeService.toggleUxMode();
  }

  protected toggleDevMode(): void {
    this.uxModeService.toggleDevMode();
  }

  protected toggleTools(): void {
    this.toolsOpen.set(!this.toolsOpen());
  }

  protected closeTools(): void {
    this.toolsOpen.set(false);
  }

  protected async signOut(): Promise<void> {
    await this.authService.signOut();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.tools-dropdown')) {
      this.closeTools();
    }
  }
}
