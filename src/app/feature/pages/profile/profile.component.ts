import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { UxModeService } from '../../../core/services/ux-mode.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  protected readonly authService = inject(AuthService);
  protected readonly uxModeService = inject(UxModeService);

  protected async signOut(): Promise<void> {
    await this.authService.signOut();
  }
}
