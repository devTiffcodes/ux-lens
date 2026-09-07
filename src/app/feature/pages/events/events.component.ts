import { Component, inject, computed } from '@angular/core';
import { UxModeService } from '../../../core/services/ux-mode.service';

interface MockEvent {
  id: string;
  title: string;
  date: string;
  day: string;
  month: string;
  displayDate: string;
  location: string;
  description: string;
  category: string;
  time: string;
  color: string;
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

  private readonly events = [
    {
      id: 'e1',
      title: 'Freshers\' Fair 2026',
      date: '2026-09-05',
      location: 'Anse Royale Campus, Main Hall',
      description: 'Welcome new students! Meet clubs, societies, and student support services.',
      category: 'Social',
      time: '09:00 – 14:00',
      color: '#e8f5e9',
    },
    {
      id: 'e2',
      title: 'UNISEY Career Fair',
      date: '2026-09-12',
      location: 'Anse Royale Campus, Lecture Block',
      description: 'Meet local employers and internship providers from across the Seychelles.',
      category: 'Career',
      time: '10:00 – 16:00',
      color: '#e3f2fd',
    },
    {
      id: 'e3',
      title: 'ICT Innovation Showcase',
      date: '2026-09-18',
      location: 'Mont Fleuri Campus, ICT Centre',
      description: 'Final year ICT students present their projects to industry guests and faculty.',
      category: 'Academic',
      time: '13:00 – 17:00',
      color: '#f3e5f5',
    },
    {
      id: 'e4',
      title: 'Nelson Mandela Day Forum',
      date: '2026-09-24',
      location: 'Anse Royale Campus, Auditorium',
      description: 'Annual forum on combating poverty and inequity in the Indian Ocean region.',
      category: 'Academic',
      time: '09:00 – 12:00',
      color: '#fff3e0',
    },
    {
      id: 'e5',
      title: 'Student Cultural Day',
      date: '2026-10-03',
      location: 'Anse Royale Campus, Grounds',
      description: 'Celebrate Seychellois culture with food, music, dance, and student performances.',
      category: 'Social',
      time: '11:00 – 18:00',
      color: '#fce4ec',
    },
    {
      id: 'e6',
      title: 'Oxford Data Concepts Workshop',
      date: '2026-10-10',
      location: 'Mont Fleuri Campus, Lab 2',
      description: 'Hands-on data literacy workshop in partnership with Oxford University Press.',
      category: 'Academic',
      time: '09:00 – 13:00',
      color: '#e8f5e9',
    },
  ];

  protected readonly displayEvents = computed(() =>
    this.events.map((event) => {
      const date = new Date(event.date);
      const isPoor = this.uxModeService.isPoorMode();
      return {
        ...event,
        day: isPoor
          ? `${date.getDate()}/${date.getMonth() + 1}`
          : date.getDate().toString(),
        month: isPoor
          ? ''
          : date.toLocaleDateString('en-GB', { month: 'short' }),
        displayDate: isPoor
          ? `${date.getDate()}/${date.getMonth() + 1}`
          : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      };
    })
  );
}
