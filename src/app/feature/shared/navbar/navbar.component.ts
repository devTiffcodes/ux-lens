import { Component, inject, signal, HostListener } from '@angular/core';
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
protected readonly toolsOpen = signal<boolean>(false)

  protected readonly navLinks = [
    { path: '/home', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/noticeboard', label: 'Noticeboard' },
    { path: '/local-info', label: 'Local Info' },
    { path: '/contact', label: 'Contact' },
  ];

  protected readonly toolLinks = [
    { path: '/surver', label: 'Survey' },
    { path: 'guidelines', label: 'Guidelines' },
    { path: 'site-analyzer', labe: 'Site Analyzer' },
  ];
  toggleUxMode(): void {
    this.uxModeService.toggleUxMode();
  }

  toggleDevMode(): void {
    this.uxModeService.toggleDevMode();
  }

  toggleTool(): void {
    this.toolsOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {

    const target = event.target as HTMLElement;
    if (!target.closesst('.tools-dropdown')) {
      this.closeTools();
    }
  }
