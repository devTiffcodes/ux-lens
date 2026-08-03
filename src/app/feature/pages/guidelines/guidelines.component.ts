import { Component } from '@angular/core';

interface GuidelinePrinciple {
  title: string;
  source: string;
  summary: string;
}

@Component({
  selector: 'app-guidelines',
  standalone: true,
  imports: [],
  templateUrl: './guidelines.component.html',
  styleUrl: './guidelines.component.css',
})
export class GuidelinesComponent {
  protected readonly principles: GuidelinePrinciple[] = [
    {
      title: 'Visibility of System Status',
      source: "Nielsen's 10 Usability Heuristics",
      summary: 'The system should always keep users informed about what is going on through appropriate feedback within reasonable time.',
    },
    {
      title: 'Consistency and Standards',
      source: "Nielsen's 10 Usability Heuristics",
      summary: 'Users should not have to wonder whether different words, situations, or actions mean the same thing.',
    },
    {
      title: 'Recognition Rather Than Recall',
      source: "Nielsen's 10 Usability Heuristics",
      summary: "Minimize the user's memory load by making elements, actions, and options visible.",
    },
    {
      title: 'Help Users Recognize and Recover from Errors',
      source: "Nielsen's 10 Usability Heuristics",
      summary: 'Error messages should be expressed in plain language, precisely indicate the problem, and suggest a solution.',
    },
    {
      title: 'Contrast Minimum',
      source: 'WCAG 2.1, Success Criterion 1.4.3',
      summary: 'Text should have a contrast ratio of at least 4.5:1 against its background to remain readable.',
    },
  ];
}
