import { Component, inject } from '@angular/core';
import { UxModeService } from '../../../core/services/ux-mode.service';

interface Course {
  id: string;
  code: string;
  title: string;
  lecturer: string;
  schedule: string;
  room: string;
  progress: number;
  credits: number;
  color: string;
}

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css',
})
export class CoursesComponent {
  protected readonly uxModeService = inject(UxModeService);

  protected readonly courses: Course[] = [
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
    },
  ];
}
