import { Routes } from '@angular/router';

/**
 * Client-side website routes.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then((module) => module.Home),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./pages/search/search').then((module) => module.Search),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about').then((module) => module.About),
  },
  {
    path: 'events/:id',
    loadComponent: () =>
      import('./pages/event-detail/event-detail').then(
        (module) => module.EventDetail
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
