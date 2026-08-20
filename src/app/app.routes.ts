import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
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
  {
    path: 'survey',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./feature/pages/survey/survey.component').then(m => m.SurveyComponent),
    title: 'UX Lens — Survey',
  },
  {
    path: 'guidelines',
    canActivate: [authGuard, roleGuard('researcher')],
    loadComponent: () =>
      import('./feature/pages/guidelines/guidelines.component').then(m => m.GuidelinesComponent),
    title: 'UX Lens — Guidelines',
  },
  {
    path: 'site-analyzer',
    canActivate: [authGuard, roleGuard('researcher')],
    loadComponent: () =>
      import('./feature/pages/site-analyzer/site-analyzer.component').then(m => m.SiteAnalyzerComponent),
    title: 'UX Lens — Site Analyzer',
  },
  {
    path: 'dashboard',
    canActivate: [authGuard, roleGuard('researcher')],
    loadComponent: () =>
      import('./feature/pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'UX Lens — Dashboard',
  },
  { path: '**', redirectTo: '' },
];
