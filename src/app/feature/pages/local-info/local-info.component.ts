import { Component, inject } from '@angular/core';
import { UxModeService } from '../../../core/services/ux-mode.service';

interface InfoCategory {
  id: string;
  label: string;
  icon: string;
  summary: string;
}

@Component({
  selector: 'app-local-info',
  standalone: true,
  imports: [],
  templateUrl: './local-info.component.html',
  styleUrl: './local-info.component.css',
})
export class LocalInfoComponent {
  protected readonly uxModeService = inject(UxModeService);

  protected readonly categories: InfoCategory[] = [
    { id: 'transport', label: 'Transport', icon: '🚌', summary: 'Bus routes and ferry schedules across Mahé, Praslin, and La Digue.' },
    { id: 'health', label: 'Healthcare', icon: '⚕', summary: 'Public clinics, hospital contacts, and emergency numbers.' },
    { id: 'services', label: 'Public Services', icon: '🏛', summary: 'Government offices, permits, and civil registration.' },
    { id: 'utilities', label: 'Utilities', icon: '💡', summary: 'Electricity, water, and waste collection schedules.' },
  ];
}
