import { Injectable, signal, computed } from '@angular/core';

export interface Notice {
  id: string;
  title: string;
  author: string;
  message: string;
  postedAt: string;
  type: 'urgent' | 'info' | 'academic' | 'general';
  tag: string;
  read: boolean;
  pinned: boolean;
}

@Injectable({ providedIn: 'root' })
export class NoticeboardService {
  readonly isLoading = signal(true);
  readonly searchQuery = signal('');
  readonly activeFilter = signal<string>('All');
  readonly filters = ['All', 'Urgent', 'Academic', 'Info', 'General'];

  readonly notices = signal<Notice[]>([]);

  readonly filteredNotices = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const filter = this.activeFilter();
    return this.notices().filter(n => {
      const matchesSearch =
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        n.author.toLowerCase().includes(query);
      const matchesFilter =
        filter === 'All' ||
        n.tag.toLowerCase() === filter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  });

  readonly unreadCount = computed(() =>
    this.notices().filter(n => !n.read).length
  );

  constructor() {
    setTimeout(() => {
      this.notices.set([
        {
          id: 'n1',
          title: 'Semester 2 Registration Deadline',
          author: 'Academic Registry',
          message: 'All students must complete module registration by 12 September 2026. Late registrations will not be accepted. Visit the registry office at Anse Royale campus or register via the student portal.',
          postedAt: 'Today',
          type: 'urgent',
          tag: 'Urgent',
          read: false,
          pinned: true,
        },
        {
          id: 'n2',
          title: 'Exam Timetable – Semester 2 2026',
          author: 'Academic Registry',
          message: 'The Semester 2 examination timetable has been published. Exams will run from 15 September to 3 October 2026. Students are advised to check their personal timetables via the student portal and report any clashes to the registry immediately.',
          postedAt: 'Today',
          type: 'academic',
          tag: 'Academic',
          read: false,
          pinned: true,
        },
        {
          id: 'n3',
          title: 'Library Extended Hours – Exam Period',
          author: 'UNISEY Library',
          message: 'The library will be open from 07:00 to 22:00 Monday to Saturday during the exam period (September 15 – October 3). Study room bookings are available at the front desk.',
          postedAt: 'Yesterday',
          type: 'info',
          tag: 'Info',
          read: false,
          pinned: false,
        },
        {
          id: 'n4',
          title: 'Final Year Project Submission Guidelines',
          author: 'Faculty of Arts and Social Development',
          message: 'Final year project reports must be submitted in PDF format via the online portal. Hard copies are no longer required. Deadline: 30 September 2026.',
          postedAt: '2 days ago',
          type: 'academic',
          tag: 'Academic',
          read: false,
          pinned: false,
        },
        {
          id: 'n5',
          title: 'IT Lab Maintenance – Mont Fleuri',
          author: 'IT Support',
          message: 'Computer Lab 1 at Mont Fleuri campus will be unavailable on Saturday 6 September due to scheduled maintenance. Lab 2 remains open.',
          postedAt: '3 days ago',
          type: 'info',
          tag: 'Info',
          read: true,
          pinned: false,
        },
        {
          id: 'n6',
          title: 'Scholarship Applications Now Open',
          author: 'Student Finance Office',
          message: 'Applications for the 2026/2027 UNISEY Merit Scholarship are now open. Eligible students must have a GPA of 3.5 or above. Apply at the finance office by 20 September.',
          postedAt: '5 days ago',
          type: 'academic',
          tag: 'Academic',
          read: true,
          pinned: false,
        },
        {
          id: 'n7',
          title: 'Campus Closure – National Holiday',
          author: 'Administration',
          message: 'UNISEY campuses will be closed on Monday 29 September in observance of the national public holiday. All scheduled classes will be rescheduled – check with your lecturers for details.',
          postedAt: '1 week ago',
          type: 'general',
          tag: 'General',
          read: true,
          pinned: false,
        },
      ]);
      this.isLoading.set(false);
    }, 800);
  }

  setSearch(query: string): void {
    this.searchQuery.set(query);
  }

  setFilter(filter: string): void {
    this.activeFilter.set(filter);
  }

  markRead(id: string): void {
    this.notices.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  markAllRead(): void {
    this.notices.update(list => list.map(n => ({ ...n, read: true })));
  }
}
