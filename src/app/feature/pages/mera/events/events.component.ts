import { Component, inject } from '@angular/core';
import { UxModeService } from '../../../../core/services/ux-mode.service';
import { EventsService } from '../../../../core/services/mera/events.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
})
export class EventsComponent {
  protected readonly uxMode = inject(UxModeService);
  protected readonly eventsService = inject(EventsService);

  protected setFilter(filter: string): void {
    this.eventsService.setFilter(filter);
  }

  protected toggleRegistration(eventId: string): void {
    this.eventsService.toggleRegistration(eventId);
  }

  protected formatDate(dateStr: string): { day: string; month: string } {
    return this.eventsService.formatDate(dateStr);
  }
}
