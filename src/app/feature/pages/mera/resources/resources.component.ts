import { Component, inject } from '@angular/core';
import { UxModeService } from '../../../../core/services/ux-mode.service';
import { ResourcesService, ResourceItem } from '../../../../core/services/mera/resources.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [],
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.css',
})
export class ResourcesComponent {
  protected readonly uxMode = inject(UxModeService);
  protected readonly resourcesService = inject(ResourcesService);
  private readonly location = inject(Location);

  protected goBack(): void {
    this.location.back();
  }

  protected onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.resourcesService.setSearch(query);
  }

  protected toggleBookmark(itemId: string): void {
    this.resourcesService.toggleBookmark(itemId);
  }

  protected handleAction(item: ResourceItem): void {
    this.resourcesService.handleAction(item);
  }
}
