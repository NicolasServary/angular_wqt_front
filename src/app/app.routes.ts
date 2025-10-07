import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'public',
    loadComponent: () => import('./public/playout/playout').then(m => m.Playout),
    children: [
      {
        path: 'grid',
        loadComponent: () => import('./public/grid/grid').then(m => m.Grid)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./public/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: '',
        redirectTo: 'grid',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/public',
    pathMatch: 'full'
  }
];
