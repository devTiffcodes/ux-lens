import { Component, inject, signal } from '@angular/core';
import { UxModeService } from '../../../core/services/ux-mode.service';

interface Notice {
  id: string;
  author: string;
  message: string;
  postedAt: string;
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
  protected readonly isLoading = signal<boolean>(true);
  protected readonly notices = signal<Notice[]>([]);

  constructor() {
    // Simulated fetch delay to demonstrate the loading-state issue.
    setTimeout(() => {
      this.notices.set([
        { id: 'n1', author: 'Marie L.', message: 'Lost cat near Anse Royale, please contact if seen.', postedAt: '2 days ago' },
        { id: 'n2', author: 'Community Admin', message: 'Water supply maintenance in Beau Vallon this Friday.', postedAt: '5 days ago' },
      ]);
      this.isLoading.set(false);
    }, 800);
  }
}
