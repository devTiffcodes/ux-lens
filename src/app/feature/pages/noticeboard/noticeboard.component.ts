import { Component, inject, signal } from '@angular/core';
import { UxModeService } from '../../../core/services/ux-mode.service';

interface Notice {
  id: string;
  title: string;
  author: string;
  message: string;
  postedAt: string;
  type: 'urgent' | 'info' | 'academic' | 'general';
  tag: string;
}

@Component({
  selector: 'app-noticeboard',
  standalone: true,
  imports: [],
  templateUrl: './noticeboard.component.html',
  styleUrl: './noticeboard.component.css',
})
export class NoticeboardComponent {
  protected readonly uxModeService = inject(UxModeService);
  protected readonly isLoading = signal(true);
  protected readonly notices = signal<Notice[]>([]);

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
        },
        {
          id: 'n2',
          title: 'Library Extended Hours — Exam Period',
          author: 'UNISEY Library',
          message: 'The library will be open from 07:00 to 22:00 Monday to Saturday during the exam period (September 15 – October 3). Study room bookings are available at the front desk.',
          postedAt: 'Yesterday',
          type: 'info',
          tag: 'Library',
        },
        {
          id: 'n3',
          title: 'Final Year Project Submission Guidelines',
          author: 'Faculty of Arts and Social Development',
          message: 'Final year project reports must be submitted in PDF format via the online portal. Hard copies are no longer required. Deadline: 30 September 2026.',
          postedAt: '2 days ago',
          type: 'academic',
          tag: 'Academic',
        },
        {
          id: 'n4',
          title: 'IT Lab Maintenance — Mont Fleuri',
          author: 'IT Support',
          message: 'Computer Lab 1 at Mont Fleuri campus will be unavailable on Saturday 6 September due to scheduled maintenance. Lab 2 remains open.',
          postedAt: '3 days ago',
          type: 'info',
          tag: 'IT',
        },
        {
          id: 'n5',
          title: 'Scholarship Applications Now Open',
          author: 'Student Finance Office',
          message: 'Applications for the 2026/2027 UNISEY Merit Scholarship are now open. Eligible students must have a GPA of 3.5 or above. Apply at the finance office by 20 September.',
          postedAt: '5 days ago',
          type: 'academic',
          tag: 'Finance',
        },
      ]);
      this.isLoading.set(false);
    }, 800);
  }
}
