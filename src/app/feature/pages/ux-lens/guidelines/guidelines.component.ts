import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GUIDELINES, Guideline } from './guidelines.data';

type Category = 'All' | 'Usability' | 'Accessibility' | 'Cognitive Wellbeing' | 'Visual Design';

const CATEGORY_ICONS: Record<string, string> = {
  'Usability': '🧭',
  'Accessibility': '♿',
  'Cognitive Wellbeing': '🧠',
  'Visual Design': '🎨',
};

@Component({
  selector: 'app-guidelines',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guidelines.component.html',
  styleUrl: './guidelines.component.css',
})
export class GuidelinesComponent {
  readonly categoryIcons = CATEGORY_ICONS;

  readonly categories: Category[] = [
    'All',
    'Usability',
    'Accessibility',
    'Cognitive Wellbeing',
    'Visual Design',
  ];

  readonly activeCategory = signal<Category>('All');
  readonly activeId = signal<string | null>(null);

  readonly filtered = computed(() => {
    const cat = this.activeCategory();
    return cat === 'All'
      ? GUIDELINES
      : GUIDELINES.filter(g => g.category === cat);
  });

  readonly activeGuideline = computed<Guideline | null>(() => {
    const id = this.activeId();
    return id ? GUIDELINES.find(g => g.id === id) ?? null : null;
  });

  readonly relatedGuidelines = computed<Guideline[]>(() => {
    const active = this.activeGuideline();
    if (!active) return [];
    return active.relatedGuidelines
      .map(id => GUIDELINES.find(g => g.id === id))
      .filter((g): g is Guideline => g !== undefined);
  });

  setCategory(cat: Category): void {
    this.activeCategory.set(cat);
    this.activeId.set(null);
  }

  openGuideline(id: string): void {
    this.activeId.set(id);
    // scroll detail panel to top
    setTimeout(() => {
      document.querySelector('.gl-detail')?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  }

  closeDetail(): void {
    this.activeId.set(null);
  }

  jumpTo(id: string): void {
    this.activeId.set(id);
    // ensure the category filter shows it
    const target = GUIDELINES.find(g => g.id === id);
    if (target) this.activeCategory.set('All');
    setTimeout(() => {
      document.querySelector('.gl-detail')?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  }

  countForCategory(cat: string): number {
    return cat === 'All'
      ? GUIDELINES.length
      : GUIDELINES.filter(g => g.category === cat).length;
  }
}
