import { Component, inject } from '@angular/core';
import { UxModeService } from '../../../core/services/ux-mode.service';
import { Location } from '@angular/common';

interface ResourceItem {
  id: string;
  icon: string;
  name: string;
  description: string;
  action: string;
}

interface ResourceCategory {
  id: string;
  title: string;
  items: ResourceItem[];
}

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [],
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.css',
})

export class ResourcesComponent {
  protected readonly uxModeService = inject(UxModeService);
  private readonly location = inject(Location);

  protected goBack(): void {
    this.location.back();
  }

  protected readonly categories: ResourceCategory[] = [
    {
      id: 'library',
      title: 'Library & Learning',
      items: [
        { id: 'l1', icon: '📚', name: 'Digital Library', description: 'Access e-books, journals, and research databases from anywhere.', action: 'Browse library' },
        { id: 'l2', icon: '🏛️', name: 'Study Room Booking', description: 'Reserve a quiet study room at Anse Royale or Mont Fleuri campus.', action: 'Book a room' },
        { id: 'l3', icon: '📖', name: 'Past Exam Papers', description: 'Review past examination papers to prepare for assessments.', action: 'View papers' },
      ],
    },
    {
      id: 'it',
      title: 'IT Support',
      items: [
        { id: 'it1', icon: '💻', name: 'Computer Labs', description: 'Lab availability and booking at Mont Fleuri ICT Centre.', action: 'Check availability' },
        { id: 'it2', icon: '🔐', name: 'Student Portal Access', description: 'Reset your student portal password or report login issues.', action: 'Get help' },
        { id: 'it3', icon: '📡', name: 'Campus Wi-Fi', description: 'Connect to UniSey campus Wi-Fi using your student credentials.', action: 'Setup guide' },
      ],
    },
    {
      id: 'admin',
      title: 'Administration',
      items: [
        { id: 'a1', icon: '🎓', name: 'Scholarships', description: 'Apply for the UNISEY Merit Scholarship and other financial awards.', action: 'Apply now' },
        { id: 'a2', icon: '📋', name: 'Internship Opportunities', description: 'Browse internship listings from local employers and government agencies.', action: 'View listings' },
        { id: 'a3', icon: '💰', name: 'Fees & Payments', description: 'View your fee statement and make payments at the finance office.', action: 'View statement' },
      ],
    },
    {
      id: 'support',
      title: 'Student Wellbeing',
      items: [
        { id: 's1', icon: '🧠', name: 'Counselling Services', description: 'Confidential support from UNISEY student counsellors.', action: 'Book session' },
        { id: 's2', icon: '⚕️', name: 'Health Centre', description: 'Access basic healthcare and referrals at the campus health centre.', action: 'Find out more' },
        { id: 's3', icon: '🏃', name: 'Sports & Recreation', description: 'Join student sports clubs and use campus recreational facilities.', action: 'Get active' },
      ],
    },
  ];
}
