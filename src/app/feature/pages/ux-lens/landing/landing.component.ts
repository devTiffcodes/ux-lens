import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent implements OnInit {
  private readonly router = inject(Router);
  protected readonly authService = inject(AuthService);

  protected readonly showSplash = signal(true);
  protected readonly showOnboarding = signal(false);
  protected readonly currentSlide = signal(0);

  protected readonly slides = [
    {
      title: 'What is UX Lens?',
      body: 'A developer research tool that shows how UI design choices affect user wellbeing — in real time, grounded in Nielsen and WCAG principles.',
      icon: '🔬',
    },
    {
      title: 'Meet Mera',
      body: 'Browse Mera, a mock Seychelles community platform built into UX Lens. Switch between Good and Poor UX mode to see how design affects how users feel.',
      icon: '🌊',
    },
    {
      title: 'The Dev Panel',
      body: 'Open the Dev Panel to see exactly which design decisions are causing harm — with AI-powered mentor feedback explaining the impact on wellbeing.',
      icon: '🧠',
    },
    {
      title: 'Who is it for?',
      body: 'Participants experience Mera and share how it made them feel. Researchers analyse the results on the Dashboard and use the Site Analyzer to audit any website.',
      icon: '👥',
    },
  ];

  ngOnInit(): void {
    /*
     * The landing page is public.
     *
     * We still show the splash/onboarding when the page is entered.
     * Once we have confirmed how AuthService exposes the Firebase
     * session, we can redirect an already-authenticated researcher
     * directly to /dashboard.
     */

    setTimeout(() => {
      this.showSplash.set(false);
      this.showOnboarding.set(true);
    }, 2500);
  }

  protected nextSlide(): void {
    const current = this.currentSlide();

    if (current < this.slides.length - 1) {
      this.currentSlide.set(current + 1);
      return;
    }

    this.goToLogin();
  }

  protected prevSlide(): void {
    const current = this.currentSlide();

    if (current > 0) {
      this.currentSlide.set(current - 1);
    }
  }

  protected goToLogin(): void {
    this.showOnboarding.set(false);
    this.router.navigate(['/login']);
  }
}
