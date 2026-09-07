import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // ─── Public ───────────────────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./feature/pages/landing/landing.component').then(m => m.LandingComponent),
    title: 'UX Lens',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./feature/pages/login/login.component').then(m => m.LoginComponent),
    title: 'UX Lens — Sign In',
  },

  // ─── UX Lens (researcher tools — main app) ────────────────────────────────
  {
    path: 'dashboard',
    canActivate: [authGuard, roleGuard('researcher')],
    loadComponent: () =>
      import('./feature/pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'UX Lens — Dashboard',
  },
  {
    path: 'site-analyzer',
    canActivate: [authGuard, roleGuard('researcher')],
    loadComponent: () =>
      import('./feature/pages/site-analyzer/site-analyzer.component').then(m => m.SiteAnalyzerComponent),
    title: 'UX Lens — Site Analyzer',
  },
  {
    path: 'results',
    canActivate: [authGuard, roleGuard('researcher')],
    loadComponent: () =>
      import('./feature/pages/results/results.component').then(m => m.ResultsComponent),
    title: 'UX Lens — Results',
  },
  {
    path: 'guidelines',
    canActivate: [authGuard, roleGuard('researcher')],
    loadComponent: () =>
      import('./feature/pages/guidelines/guidelines.component').then(m => m.GuidelinesComponent),
    title: 'UX Lens — Guidelines',
  },
  {
    path: 'survey',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./feature/pages/survey/survey.component').then(m => m.SurveyComponent),
    title: 'UX Lens — Survey',
  },

  // ─── Mera (participant test environment — accessed via URL only) ───────────
  {
    path: 'mera',
    redirectTo: 'mera/home',
    pathMatch: 'full',
  },
  {
    path: 'mera/home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./feature/pages/home/home.component').then(m => m.HomeComponent),
    title: 'Mera — Home',
  },
  {
    path: 'mera/events',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./feature/pages/events/events.component').then(m => m.EventsComponent),
    title: 'Mera — Events',
  },
  {
    path: 'mera/noticeboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./feature/pages/noticeboard/noticeboard.component').then(m => m.NoticeboardComponent),
    title: 'Mera — Noticeboard',
  },
  {
    path: 'mera/courses',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./feature/pages/courses/courses.component').then(m => m.CoursesComponent),
    title: 'Mera — My Courses',
  },
  {
    path: 'mera/resources',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./feature/pages/resources/resources.component').then(m => m.ResourcesComponent),
    title: 'Mera — Resources',
  },
  {
    path: 'mera/profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./feature/pages/profile/profile.component').then(m => m.ProfileComponent),
    title: 'Mera — Profile',
  },
  {
    path: 'mera/local-info',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./feature/pages/local-info/local-info.component').then(m => m.LocalInfoComponent),
    title: 'Mera — Local Info',
  },
  {
    path: 'mera/contact',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./feature/pages/contact/contact.component').then(m => m.ContactComponent),
    title: 'Mera — Contact',
  },

  // ─── Fallback ─────────────────────────────────────────────────────────────
  { path: '**', redirectTo: '' },
];
