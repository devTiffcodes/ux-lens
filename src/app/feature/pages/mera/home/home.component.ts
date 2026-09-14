import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomeService } from '../../../../core/services/mera/home.service';
import { UxModeService } from '../../../../core/services/ux-mode.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  protected readonly home = inject(HomeService);
  protected readonly uxMode = inject(UxModeService);

  protected markRead(id: string): void {
    this.home.markAnnouncementRead(id);
  }

  protected getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }
}
