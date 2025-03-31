import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'projects',
    loadComponent: async () => (await import('./projects/projects-overview/projects-overview.component')).ProjectsOverviewComponent,
  },
  {
    path: 'projects/new',
    loadComponent: async () => (await import('./projects/create-project/create-project.component')).CreateProjectComponent,
    data: {
      canNavigateBack: true,
    },
  },
  {
    path: 'projects/:id',
    loadComponent: async () => (await import('./projects/edit-project/edit-project.component')).EditProjectComponent,
    data: {
      canNavigateBack: true,
    },
  },
  {
    path: 'design',
    loadComponent: async () => (await import('./design/designer/designer.component')).DesignerComponent,
    data: {
      canNavigateBack: true,
    },
  },
  {
    path: '',
    redirectTo: 'projects',
    pathMatch: 'full',
  },
];
