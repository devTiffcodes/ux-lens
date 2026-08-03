import { Component, inject } from '@angular/core';
import { UxModeService } from '../../../core/services/ux-mode.service';

@Component({
  selector: 'app-ux-mode-banner',
  standalone: true,
  imports: [],
  templateUrl: './ux-mode-banner.component.html',
  styleUrl: './ux-mode-banner.component.css',
})
export class UxModeBannerComponent {
  protected readonly uxModeService = inject(UxModeService);
}
