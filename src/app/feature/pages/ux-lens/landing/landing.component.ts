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
      body: 'A UX research tool that explores how website interface design affects user wellbeing — built as part of a final-year study grounded in 28 UX laws.',
      icon: '🔬',
    },
    {
      title: 'Meet Mera',
      body: 'Mera is a mock University student portal built into UX Lens. You will complete tasks on it in two modes — Good UX and Poor UX — to see how design affects how you feel.',
      icon: '🌊',
    },
    {
      title: 'Your Tasks',
      body: 'You will be given 5 tasks to complete across Mera\'s pages — Home, Events, My Courses, Noticeboard, and Profile. Complete each task in both UX modes.',
      icon: '✅',
    },
    {
      title: 'The Survey',
      body: 'After completing tasks in each mode, you will fill in a short survey rating your experience across task completion, cognitive load, emotional wellbeing, and visual comfort.',
      icon: '📋',
    },
    {
      title: 'Your Privacy',
      body: 'Your responses are anonymous and used only for academic research. No personal data is collected beyond what you share in the survey.',
      icon: '🔒',
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
