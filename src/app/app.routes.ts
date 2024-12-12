import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'splash',
    loadComponent: () => import('./splash-screen/splash-screen.component').then(m => m.SplashScreenComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage),
  },
  {
    path: 'event/:id',
    loadComponent: () => import('./pages/event-details/event-details.page').then(m => m.EventDetailsPage),
  },
  {
    path: 'guest-list/:id',
    loadComponent: () => import('./pages/guest-list/guest-list.page').then(m => m.GuestListPage),
  },
];
