import { Component, inject } from '@angular/core';
import { UxModeService } from '../../../../core/services/ux-mode.service';
import { NoticeboardService } from '../../../../core/services/mera/noticeboard.service';

@Component({
  selector: 'app-noticeboard',
  standalone: true,
  imports: [],
  templateUrl: './noticeboard.component.html',
  styleUrl: './noticeboard.component.css',
})
export class NoticeboardComponent {
  protected readonly uxMode = inject(UxModeService);
  protected readonly noticeService = inject(NoticeboardService);

  protected onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.noticeService.setSearch(query);
  }

  protected setFilter(filter: string): void {
    this.noticeService.setFilter(filter);
  }

  protected markRead(id: string): void {
    this.noticeService.markRead(id);
  }

  protected markAllRead(): void {
    this.noticeService.markAllRead();
  }
}
