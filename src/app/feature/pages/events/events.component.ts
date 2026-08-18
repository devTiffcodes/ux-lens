import { Component, inject, computed } from '@angular/core';
import { UxModeService } from '../../../core/services/ux-mode.service';

interface MockEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
})
export class EventsComponent {
  protected readonly uxModeService = inject(UxModeService);

  private readonly events: MockEvent[] = [
    { id: 'e1', title: 'Victoria Market Food Fair', date: '2026-03-04', location: 'Victoria Market', description: 'Local vendors, food stalls, and live music.' },
    { id: 'e2', title: 'Beau Vallon Beach Cleanup', date: '2026-03-12', location: 'Beau Vallon', description: 'Community beach cleanup, all welcome.' },
    { id: 'e3', title: 'UNISEY Career Fair', date: '2026-03-20', location: 'UNISEY Campus', description: 'Meet local employers and internship providers.' },
  ];

  protected readonly displayEvents = computed(() =>
    this.events.map((event) => ({
      ...event,
      displayDate: this.formatDate(event.date),
    }))
  );

  private formatDate(isoDate: string): string {
    const date = new Date(isoDate);

    if (this.uxModeService.isPoorMode()) {
      // Poor UX: ambiguous, unlabelled numeric format (day/month unclear)
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}
