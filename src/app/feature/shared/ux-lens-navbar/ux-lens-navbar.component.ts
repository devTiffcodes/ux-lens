import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-ux-lens-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './ux-lens-navbar.component.html',
  styleUrl: './ux-lens-navbar.component.css',
})
export class UxLensNavbarComponent {
  protected readonly authService = inject(AuthService);
  protected readonly profileOpen = signal<boolean>(false);

  protected readonly navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/site-analyzer', label: 'Site Analyzer' },
    { path: '/guidelines', label: 'Guidelines' },
    { path: '/survey', label: 'Survey' },
  ];

  protected toggleProfile(): void {
    this.profileOpen.update(v => !v);
  }

  protected closeProfile(): void {
    this.profileOpen.set(false);
  }

  protected async signOut(): Promise<void> {
    this.closeProfile();
    await this.authService.signOut();
  }
}
