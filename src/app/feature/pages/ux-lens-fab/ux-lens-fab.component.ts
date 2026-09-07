import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UxModeService } from '../../../core/services/ux-mode.service';

@Component({
  selector: 'app-ux-lens-fab',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './ux-lens-fab.component.html',
  styleUrl: './ux-lens-fab.component.css',
})
export class UxLensFabComponent {
  protected readonly uxModeService = inject(UxModeService);
  protected readonly isOpen = signal<boolean>(false);

  protected togglePanel(): void {
    this.isOpen.set(!this.isOpen());
  }

  protected toggleMode(): void {
    this.uxModeService.toggleUxMode();
  }

  protected toggleDev(): void {
    this.uxModeService.toggleDevMode();
  }
}
