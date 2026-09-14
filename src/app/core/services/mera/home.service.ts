import { Injectable, signal } from '@angular/core';

export interface ScheduleItem {
  time: string;
  subject: string;
  location: string;
}

export interface Assignment {
  id: string;
  course: string;
  title: string;
  dueDate: string;
  dueLabel: string;
  submitted: boolean;
  urgent: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  read: boolean;
}

export interface WellbeingTip {
  icon: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class HomeService {
  readonly studentName = signal('Tiffania');
  readonly semester = signal('Semester 2 · 2026');
  readonly overallProgress = signal(68);
  readonly enrolledCount = signal(4);

  readonly schedule = signal<ScheduleItem[]>([
    { time: '09:00', subject: 'Web Development II', location: 'Computer Lab · Room 204' },
    { time: '11:00', subject: 'Database Systems', location: 'Lecture Hall · Room 102' },
    { time: '14:00', subject: 'Project Work', location: 'Independent study' },
  ]);

  readonly assignments = signal<Assignment[]>([
    { id: 'a1', course: 'Web Development II', title: 'Final website project', dueDate: '2026-09-10', dueLabel: 'Sep 10', submitted: false, urgent: true },
    { id: 'a2', course: 'Project Report Writing', title: 'Literature review', dueDate: '2026-09-15', dueLabel: 'Sep 15', submitted: false, urgent: false },
    { id: 'a3', course: 'Windows Server Infrastructure', title: 'Practical assessment', dueDate: '2026-09-20', dueLabel: 'Sep 20', submitted: true, urgent: false },
  ]);

  readonly announcements = signal<Announcement[]>([
    { id: 'n1', title: 'Library hours updated', source: 'Student Services', timeAgo: 'Today', read: false },
    { id: 'n2', title: 'Student event this Friday', source: 'Student Affairs', timeAgo: 'Yesterday', read: false },
    { id: 'n3', title: 'Semester registration reminder', source: 'Administration', timeAgo: '2 days ago', read: true },
  ]);

  readonly wellbeingTip = signal<WellbeingTip>({
    icon: '🌿',
    message: 'Take a 5-minute break every hour to reduce eye strain and improve focus.',
  });

  markAnnouncementRead(id: string): void {
    this.announcements.update(list =>
      list.map(a => a.id === id ? { ...a, read: true } : a)
    );
  }

  getUnreadCount(): number {
    return this.announcements().filter(a => !a.read).length;
  }
}
