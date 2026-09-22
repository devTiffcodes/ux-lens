import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
    instruction:
      'Find your next upcoming assignment or deadline on the Home page.',
  },
  {
    id: 'task-2',
    page: 'Events',
    icon: '📅',
    instruction:
      'Locate a campus event happening this month and note its date.',
  },
  {
    id: 'task-3',
    page: 'My Courses',
    icon: '📚',
    instruction:
      'Find the course with the most upcoming content and identify its lecturer.',
  },
  {
    id: 'task-4',
    page: 'Noticeboard',
    icon: '📋',
    instruction:
      'Find the most recent official notice posted by administration.',
  },
  {
    id: 'task-5',
    page: 'Profile',
    icon: '👤',
    instruction:
      'Update your notification preferences and save your changes.',
  },
];

@Component({
  selector: 'app-study-tasks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './study-tasks.component.html',
  styleUrl: './study-tasks.component.css',
})
export class StudyTasksComponent {

  private readonly router = inject(Router);

  protected readonly tasks = STUDY_TASKS;

  protected readonly panelOpen = signal(true);

  protected readonly expandedTask = signal<string | null>(null);

  protected readonly completedTasks = signal<Set<string>>(
    this.loadCompletedTasks()
  );

  protected readonly completedCount = computed(
    () => this.completedTasks().size
  );

  protected readonly progress = computed(() => {
    return Math.round(
      (this.completedCount() / this.tasks.length) * 100
    );
  });

  protected readonly allTasksComplete = computed(
    () => this.completedTasks().size === this.tasks.length
  );

  protected togglePanel(): void {
    this.panelOpen.update(open => !open);
  }

  protected toggleTask(taskId: string): void {
    const updated = new Set(this.completedTasks());

    if (updated.has(taskId)) {
      updated.delete(taskId);
    } else {
      updated.add(taskId);
    }

    this.completedTasks.set(updated);

    sessionStorage.setItem(
      'mera_completed_tasks',
      JSON.stringify([...updated])
    );

    // Navigate to survey when all tasks are checked
    if (updated.size === this.tasks.length) {
      this.router.navigate(['/survey']);
    }
  }

  protected toggleExpanded(taskId: string): void {
    this.expandedTask.update(
      current => current === taskId ? null : taskId
    );
  }

  protected isCompleted(taskId: string): boolean {
    return this.completedTasks().has(taskId);
  }

  protected isExpanded(taskId: string): boolean {
    return this.expandedTask() === taskId;
  }

  private loadCompletedTasks(): Set<string> {
    try {
      const stored = sessionStorage.getItem(
        'mera_completed_tasks'
      );

      if (!stored) {
        return new Set<string>();
      }

      const parsed = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        return new Set<string>();
      }

      return new Set<string>(parsed);

    } catch {
      return new Set<string>();
    }
  }
}
