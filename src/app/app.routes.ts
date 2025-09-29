import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'public',
    loadComponent: () => import('./public/playout/playout').then(m => m.Playout),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./public/home/home').then(m => m.Home)
      },
      {
        path: 'grid',
        loadComponent: () => import('./public/grid/grid').then(m => m.Grid)
      },
      {
        path: 'card',
        loadComponent: () => import('./public/card/card').then(m => m.Card)
      },
      {
        path: 'minimal',
        loadComponent: () => import('./public/minimal/minimal').then(m => m.Minimal)
      },
      {
        path: 'modern',
        loadComponent: () => import('./public/modern/modern').then(m => m.Modern)
      },
      {
        path: 'compact',
        loadComponent: () => import('./public/compact/compact').then(m => m.Compact)
      },
      {
        path: 'elegant',
        loadComponent: () => import('./public/elegant/elegant').then(m => m.Elegant)
      },
      {
        path: 'industrial',
        loadComponent: () => import('./public/industrial/industrial').then(m => m.Industrial)
      },
      {
        path: 'zen',
        loadComponent: () => import('./public/zen/zen').then(m => m.Zen)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./public/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: '',
        redirectTo: 'home',
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
