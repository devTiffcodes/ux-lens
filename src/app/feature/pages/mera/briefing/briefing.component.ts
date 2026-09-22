import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface StudyTask {
  id: string;
  page: string;
  instruction: string;
  icon: string;
}

const STUDY_TASKS: StudyTask[] = [
  {
    id: 'task-1',
    page: 'Home',
    icon: '🏠',
    instruction: 'Find your next upcoming assignment or deadline on the Home page.',
  },
  {
    id: 'task-2',
    page: 'Events',
    icon: '📅',
    instruction: 'Locate a campus event happening this month and note its date.',
  },
  {
    id: 'task-3',
    page: 'My Courses',
    icon: '📚',
    instruction: 'Find the course with the most upcoming content and identify its lecturer.',
  },
  {
    id: 'task-4',
    page: 'Noticeboard',
    icon: '📋',
    instruction: 'Find the most recent official notice posted by administration.',
  },
  {
    id: 'task-5',
    page: 'Profile',
    icon: '👤',
    instruction: 'Update your notification preferences and save your changes.',
  },
];

@Component({
  selector: 'app-briefing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './briefing.component.html',
  styleUrl: './briefing.component.css',
})
export class BriefingComponent {
  protected readonly tasks = STUDY_TASKS;
  protected readonly agreed = signal(false);

  constructor(private readonly router: Router) { }

  protected toggleAgreement(): void {
    this.agreed.set(!this.agreed());
  }

  protected beginStudy(): void {
    sessionStorage.setItem('briefing_accepted', 'true');

    // Start a fresh participant task checklist.
    sessionStorage.removeItem('mera_completed_tasks');

    this.router.navigate(['/mera/home']);
  }
}
