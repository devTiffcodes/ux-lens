import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./feature/pages/home/home.component').then(m => m.HomeComponent),
    title: 'Mera — Home',
  },
  {
    path: 'events',
    loadComponent: () => import('./feature/pages/events/events.component').then(m => m.EventsComponent),
    title: 'Mera — Events',
  },
  {
    path: 'noticeboard',
    loadComponent: () => import('./feature/pages/noticeboard/noticeboard.component').then(m => m.NoticeboardComponent),
    title: 'Mera — Noticeboard',
  },
  {
    path: 'local-info',
    loadComponent: () => import('./feature/pages/local-info/local-info.component').then(m => m.LocalInfoComponent),
    title: 'Mera — Local Info',
  },
  {
    path: 'contact',
    loadComponent: () => import('./feature/pages/contact/contact.component').then(m => m.ContactComponent),
    title: 'Mera — Contact',
  },
  {
    path: 'survey',
    loadComponent: () => import('./feature/pages/survey/survey.component').then(m => m.SurveyComponent),
    title: 'UX Lens — Survey',
  },
  {
    path: 'guidelines',
    loadComponent: () => import('./feature/pages/guidelines/guidelines.component').then(m => m.GuidelinesComponent),
    title: 'UX Lens — Guidelines',
  },
  {
    path: 'site-analyzer',
    loadComponent: () => import('./feature/pages/site-analyzer/site-analyzer.component').then(m => m.SiteAnalyzerComponent),
    title: 'UX Lens — Site Analyzer',
  },
  {
    path: 'login',
    loadComponent: () => import('./feature/pages/login/login.component').then(m => m.LoginComponent),
    title: 'UX Lens — Login',
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./feature/pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'UX Lens — Dashboard',
  },
  { path: '**', redirectTo: 'home' },
];
