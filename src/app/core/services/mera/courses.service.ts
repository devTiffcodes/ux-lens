import { Injectable, signal } from '@angular/core';

export interface Assignment {
  id: string;
  title: string;
  dueLabel: string;
  dueDate: string;
  submitted: boolean;
  urgent: boolean;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  lecturer: string;
  schedule: string;
  room: string;
  progress: number;
  credits: number;
  color: string;
  assignments: Assignment[];
  expanded: boolean;
}

@Injectable({ providedIn: 'root' })
export class CoursesService {
  readonly courses = signal<Course[]>([
    {
      id: 'c1',
      code: 'SICT2206',
      title: 'Project Report Writing',
      lecturer: 'Mr. Samuel Williams Mundua',
      schedule: 'Mon & Wed · 09:00 – 11:00',
      room: 'Anse Royale · Room 204',
      progress: 72,
      credits: 15,
      color: '#e8f5e9',
      expanded: false,
      assignments: [
        { id: 'a1', title: 'Literature Review', dueLabel: 'Sep 15', dueDate: '2026-09-15', submitted: true, urgent: false },
        { id: 'a2', title: 'Research Methodology Draft', dueLabel: 'Sep 28', dueDate: '2026-09-28', submitted: false, urgent: false },
        { id: 'a3', title: 'Final Project Report', dueLabel: 'Sep 30', dueDate: '2026-09-30', submitted: false, urgent: true },
      ],
    },
    {
      id: 'c2',
      code: 'SICT2204',
      title: 'Web Development II',
      lecturer: 'Ms. Farida Hassan',
      schedule: 'Tue & Thu · 11:00 – 13:00',
      room: 'Mont Fleuri · Computer Lab 1',
      progress: 65,
      credits: 15,
      color: '#e3f2fd',
      expanded: false,
      assignments: [
        { id: 'a4', title: 'Responsive Layout Exercise', dueLabel: 'Sep 8', dueDate: '2026-09-08', submitted: true, urgent: false },
        { id: 'a5', title: 'Final Website Project', dueLabel: 'Sep 10', dueDate: '2026-09-10', submitted: false, urgent: true },
      ],
    },
    {
      id: 'c3',
      code: 'SICT2205',
      title: 'Database Systems',
      lecturer: 'Mr. Jean-Pierre Esparon',
      schedule: 'Mon · 14:00 – 17:00',
      room: 'Anse Royale · Room 102',
      progress: 80,
      credits: 15,
      color: '#f3e5f5',
      expanded: false,
      assignments: [
        { id: 'a6', title: 'ER Diagram Submission', dueLabel: 'Sep 12', dueDate: '2026-09-12', submitted: false, urgent: false },
        { id: 'a7', title: 'SQL Query Lab Report', dueLabel: 'Sep 22', dueDate: '2026-09-22', submitted: false, urgent: false },
      ],
    },
    {
      id: 'c4',
      code: 'SICT2203',
      title: 'Windows Server Infrastructure',
      lecturer: 'Ms. Nadia Volcere',
      schedule: 'Fri · 09:00 – 12:00',
      room: 'Mont Fleuri · Server Lab',
      progress: 55,
      credits: 15,
      color: '#fff3e0',
      expanded: false,
      assignments: [
        { id: 'a8', title: 'Active Directory Setup Report', dueLabel: 'Sep 18', dueDate: '2026-09-18', submitted: false, urgent: false },
        { id: 'a9', title: 'Practical Assessment', dueLabel: 'Sep 20', dueDate: '2026-09-20', submitted: false, urgent: false },
      ],
    },
  ]);

  readonly submittedAssignmentIds = signal<Set<string>>(new Set());
  readonly toastMessage = signal<string | null>(null);

  toggleExpanded(courseId: string): void {
    this.courses.update(list =>
      list.map(c => c.id === courseId ? { ...c, expanded: !c.expanded } : c)
    );
  }

  submitAssignment(courseId: string, assignmentId: string, title: string): void {
    this.courses.update(list =>
      list.map(c => c.id === courseId
        ? {
          ...c,
          assignments: c.assignments.map(a =>
            a.id === assignmentId ? { ...a, submitted: true } : a
          ),
        }
        : c
      )
    );
    this.showToast(`✅ "${title}" submitted successfully.`);
  }

  showToast(message: string): void {
    this.toastMessage.set(message);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
