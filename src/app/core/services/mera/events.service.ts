import { Injectable, signal, computed } from '@angular/core';

export interface MeraEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  category: 'Academic' | 'Social' | 'Career' | 'Sports';
  time: string;
  color: string;
  registered: boolean;
}

@Injectable({ providedIn: 'root' })
export class EventsService {
  readonly activeFilter = signal<string>('All');
  readonly toastMessage = signal<string | null>(null);

  readonly events = signal<MeraEvent[]>([
    {
      id: 'e1',
      title: "Freshers' Fair 2026",
      date: '2026-09-05',
      location: 'Anse Royale Campus, Main Hall',
      description: 'Welcome new students! Meet clubs, societies, and student support services.',
      category: 'Social',
      time: '09:00 – 14:00',
      color: '#e8f5e9',
      registered: false,
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
      registered: false,
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
      registered: false,
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
      registered: false,
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
      registered: false,
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
      registered: false,
    },
    {
      id: 'e7',
      title: 'Inter-Campus Football Tournament',
      date: '2026-10-17',
      location: 'Anse Royale Campus, Sports Ground',
      description: 'Annual football tournament between Anse Royale and Mont Fleuri campuses.',
      category: 'Sports',
      time: '08:00 – 17:00',
      color: '#e0f7fa',
      registered: false,
    },
    {
      id: 'e8',
      title: 'Study Skills Workshop',
      date: '2026-10-22',
      location: 'Mont Fleuri Campus, Room 101',
      description: 'Learn effective revision techniques, time management, and exam preparation strategies.',
      category: 'Academic',
      time: '10:00 – 12:00',
      color: '#f3e5f5',
      registered: false,
    },
  ]);

  readonly filters = ['All', 'Academic', 'Social', 'Career', 'Sports'];

  readonly filteredEvents = computed(() => {
    const filter = this.activeFilter();
    return this.events().filter(e => filter === 'All' || e.category === filter);
  });

  readonly registeredEvents = computed(() =>
    this.events().filter(e => e.registered)
  );

  setFilter(filter: string): void {
    this.activeFilter.set(filter);
  }

  toggleRegistration(eventId: string): void {
    const event = this.events().find(e => e.id === eventId);
    if (!event) return;

    const wasRegistered = event.registered;
    this.events.update(list =>
      list.map(e => e.id === eventId ? { ...e, registered: !e.registered } : e)
    );

    this.showToast(
      wasRegistered
        ? `❌ Cancelled registration for "${event.title}"`
        : `✅ You're registered for "${event.title}"!`
    );
  }

  formatDate(dateStr: string): { day: string; month: string } {
    const date = new Date(dateStr);
    return {
      day: date.getDate().toString(),
      month: date.toLocaleDateString('en-GB', { month: 'short' }),
    };
  }

  showToast(message: string): void {
    this.toastMessage.set(message);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
