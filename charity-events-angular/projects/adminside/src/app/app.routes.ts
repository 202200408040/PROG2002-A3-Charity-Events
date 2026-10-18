import { Routes } from '@angular/router';

/**
 * Admin-side website routes.
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'events',
  },
  {
    path: 'events',
    loadComponent: () =>
      import('./pages/events/event-list/event-list').then(
        (module) => module.AdminEventList
      ),
  },
  {
    path: 'events/new',
    loadComponent: () =>
      import('./pages/events/event-form/event-form').then(
        (module) => module.AdminEventForm
      ),
  },
  {
    path: 'events/:id/edit',
    loadComponent: () =>
      import('./pages/events/event-form/event-form').then(
        (module) => module.AdminEventForm
      ),
  },
  {
    path: '**',
    redirectTo: 'events',
  },
];
