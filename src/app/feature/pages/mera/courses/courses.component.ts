import { Component, inject } from '@angular/core';
import { UxModeService } from '../../../../core/services/ux-mode.service';
import { CoursesService } from '../../../../core/services/mera/courses.service';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css',
})
export class CoursesComponent {
  protected readonly uxMode = inject(UxModeService);
  protected readonly coursesService = inject(CoursesService);

  protected toggle(courseId: string): void {
    this.coursesService.toggleExpanded(courseId);
  }

  protected submit(courseId: string, assignmentId: string, title: string, submitted: boolean): void {
    if (submitted) return;
    this.coursesService.submitAssignment(courseId, assignmentId, title);
  }
}
