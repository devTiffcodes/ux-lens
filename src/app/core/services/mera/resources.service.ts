import { Injectable, signal, computed } from '@angular/core';

export interface ResourceItem {
  id: string;
  icon: string;
  name: string;
  description: string;
  action: string;
  course?: string;
  type: 'download' | 'link' | 'booking';
  bookmarked: boolean;
  fileName?: string;
}

export interface ResourceCategory {
  id: string;
  title: string;
  items: ResourceItem[];
}

@Injectable({ providedIn: 'root' })
export class ResourcesService {
  readonly searchQuery = signal('');
  readonly toastMessage = signal<string | null>(null);

  readonly categories = signal<ResourceCategory[]>([
    {
      id: 'library',
      title: 'Library & Learning',
      items: [
        {
          id: 'l1', icon: '📚', name: 'Digital Library',
          description: 'Access e-books, journals, and research databases from anywhere.',
          action: 'Browse library', type: 'link', bookmarked: false,
        },
        {
          id: 'l2', icon: '🏛️', name: 'Study Room Booking',
          description: 'Reserve a quiet study room at Anse Royale or Mont Fleuri campus.',
          action: 'Book a room', type: 'booking', bookmarked: false,
        },
        {
          id: 'l3', icon: '📖', name: 'Past Exam Papers',
          description: 'Review past examination papers to prepare for assessments.',
          action: 'Download papers', type: 'download', bookmarked: false,
          course: 'General', fileName: 'past-exam-papers-2025.pdf',
        },
      ],
    },
    {
      id: 'course-materials',
      title: 'Course Materials',
      items: [
        {
          id: 'cm1', icon: '🌐', name: 'Web Development II – Lecture Notes',
          description: 'Full set of lecture slides and code samples for SICT2204.',
          action: 'Download', type: 'download', bookmarked: false,
          course: 'SICT2204', fileName: 'webdev2-lecture-notes.pdf',
        },
        {
          id: 'cm2', icon: '🗄️', name: 'Database Systems – Lab Worksheets',
          description: 'SQL exercises and ER diagram worksheets for SICT2205.',
          action: 'Download', type: 'download', bookmarked: false,
          course: 'SICT2205', fileName: 'db-lab-worksheets.pdf',
        },
        {
          id: 'cm3', icon: '📝', name: 'Project Report Writing – APA Guide',
          description: 'APA referencing guide and report template for SICT2206.',
          action: 'Download', type: 'download', bookmarked: false,
          course: 'SICT2206', fileName: 'apa-report-guide.pdf',
        },
        {
          id: 'cm4', icon: '🖥️', name: 'Windows Server – Lab Manual',
          description: 'Step-by-step lab manual for Active Directory and Group Policy.',
          action: 'Download', type: 'download', bookmarked: false,
          course: 'SICT2203', fileName: 'windows-server-lab-manual.pdf',
        },
      ],
    },
    {
      id: 'it',
      title: 'IT Support',
      items: [
        {
          id: 'it1', icon: '💻', name: 'Computer Labs',
          description: 'Lab availability and booking at Mont Fleuri ICT Centre.',
          action: 'Check availability', type: 'link', bookmarked: false,
        },
        {
          id: 'it2', icon: '🔑', name: 'Student Portal Access',
          description: 'Reset your student portal password or report login issues.',
          action: 'Get help', type: 'link', bookmarked: false,
        },
        {
          id: 'it3', icon: '📡', name: 'Campus Wi-Fi Setup Guide',
          description: 'Connect to UniSey campus Wi-Fi using your student credentials.',
          action: 'Download guide', type: 'download', bookmarked: false,
          fileName: 'wifi-setup-guide.pdf',
        },
      ],
    },
    {
      id: 'admin',
      title: 'Administration',
      items: [
        {
          id: 'a1', icon: '🎓', name: 'Scholarships',
          description: 'Apply for the UNISEY Merit Scholarship and other financial awards.',
          action: 'Apply now', type: 'link', bookmarked: false,
        },
        {
          id: 'a2', icon: '📋', name: 'Internship Opportunities',
          description: 'Browse internship listings from local employers and government agencies.',
          action: 'View listings', type: 'link', bookmarked: false,
        },
        {
          id: 'a3', icon: '💰', name: 'Fees & Payments',
          description: 'View your fee statement and make payments at the finance office.',
          action: 'View statement', type: 'link', bookmarked: false,
        },
      ],
    },
    {
      id: 'support',
      title: 'Student Wellbeing',
      items: [
        {
          id: 's1', icon: '🧠', name: 'Counselling Services',
          description: 'Confidential support from UNISEY student counsellors.',
          action: 'Book session', type: 'booking', bookmarked: false,
        },
        {
          id: 's2', icon: '⚕️', name: 'Health Centre',
          description: 'Access basic healthcare and referrals at the campus health centre.',
          action: 'Find out more', type: 'link', bookmarked: false,
        },
        {
          id: 's3', icon: '🏃', name: 'Sports & Recreation',
          description: 'Join student sports clubs and use campus recreational facilities.',
          action: 'Get active', type: 'link', bookmarked: false,
        },
      ],
    },
  ]);

  readonly filteredCategories = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.categories();
    return this.categories()
      .map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
        ),
      }))
      .filter(cat => cat.items.length > 0);
  });

  readonly bookmarkedItems = computed(() =>
    this.categories()
      .flatMap(c => c.items)
      .filter(i => i.bookmarked)
  );

  setSearch(query: string): void {
    this.searchQuery.set(query);
  }

  toggleBookmark(itemId: string): void {
    const item = this.categories().flatMap(c => c.items).find(i => i.id === itemId);
    if (!item) return;
    const wasBookmarked = item.bookmarked;
    this.categories.update(cats =>
      cats.map(cat => ({
        ...cat,
        items: cat.items.map(i =>
          i.id === itemId ? { ...i, bookmarked: !i.bookmarked } : i
        ),
      }))
    );
    this.showToast(
      wasBookmarked
        ? `🔖 Removed "${item.name}" from bookmarks`
        : `🔖 Bookmarked "${item.name}"`
    );
  }

  handleAction(item: ResourceItem): void {
    if (item.type === 'download') {
      this.showToast(`⬇️ Downloading "${item.fileName ?? item.name}"…`);
    } else if (item.type === 'booking') {
      this.showToast(`📅 Opening booking for "${item.name}"…`);
    } else {
      this.showToast(`🔗 Opening "${item.name}"…`);
    }
  }

  showToast(message: string): void {
    this.toastMessage.set(message);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
