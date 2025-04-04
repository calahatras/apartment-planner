import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { StorageService } from '../../storage/storage.service';
import { ApartmentFloor, Furniture, Project } from './project';

interface ProjectsState {
  projects: Project[];
  isLoading: boolean;
}

const initialState: ProjectsState = {
  projects: [],
  isLoading: false,
};

function generateUUID() {
  return crypto.randomUUID();
}

export const ProjectsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, storage = inject(StorageService)) => ({
    async addProject(project: Omit<Project, 'id'>): Promise<void> {
      const newProject = {
        ...project,
        id: generateUUID(),
      };
      patchState(store, state => ({
        ...state,
        projects: [
          ...state.projects,
          newProject,
        ],
      }));

      const db = await storage.openWriteStore<Project>('projects');
      await db.add(newProject);
      console.log('added project to store', newProject);
    },
    async editProject(id: Project['id'], project: Partial<Omit<Project, 'id'>>): Promise<void> {
      const existingProject = store.projects().find(p => p.id === id);
      if (!existingProject) {
        throw new Error(`Project with id ${id} not found`);
      }
      const updatedProject: Project = {
        ...existingProject,
        ...project,
      };
      patchState(store, state => ({
        ...state,
        projects: state.projects.map(p => p.id === id ? updatedProject : p),
      }));

      const db = await storage.openWriteStore<Project>('projects');
      await db.update(updatedProject);
      console.log('updated project in store', updatedProject);
    },
    async addFloor(projectId: Project['id'], floor: Omit<ApartmentFloor, 'id'>): Promise<void> {
      const existingProject = store.projects().find(p => p.id === projectId);
      if (!existingProject) {
        throw new Error(`Project with id ${projectId} not found`);
      }
      const newFloor = {
        ...floor,
        id: generateUUID(),
      };
      const updatedProject: Project = {
        ...existingProject,
        floors: [
          ...existingProject.floors,
          newFloor,
        ],
      };
      patchState(store, state => ({
        ...state,
        projects: state.projects.map(p => p.id === projectId ? updatedProject : p),
      }));

      const db = await storage.openWriteStore<Project>('projects');
      await db.update(updatedProject);
      console.log('added floor to project', updatedProject);
    },
    async removeFloor(projectId: Project['id'], floorId: ApartmentFloor['id']): Promise<void> {
      const existingProject = store.projects().find(p => p.id === projectId);
      if (!existingProject) {
        throw new Error(`Project with id ${projectId} not found`);
      }
      const updatedProject: Project = {
        ...existingProject,
        floors: existingProject.floors.filter(f => f.id !== floorId),
      };
      patchState(store, state => ({
        ...state,
        projects: state.projects.map(p => p.id === projectId ? updatedProject : p),
      }));

      const db = await storage.openWriteStore<Project>('projects');
      await db.update(updatedProject);
      console.log('removed floor from project', updatedProject);
    },
    async addFurniture(projectId: Project['id'], floorId: ApartmentFloor['id'], furniture: Furniture): Promise<void> {
      const existingProject = store.projects().find(p => p.id === projectId);
      if (!existingProject) {
        throw new Error(`Project with id ${projectId} not found`);
      }
      const existingFloor = existingProject.floors.find(f => f.id === floorId);
      if (!existingFloor) {
        throw new Error(`Floor with id ${floorId} not found`);
      }
      const updatedFloor: ApartmentFloor = {
        ...existingFloor,
        furniture: [
          ...existingFloor.furniture,
          furniture,
        ],
      };
      const updatedProject: Project = {
        ...existingProject,
        floors: existingProject.floors.map(f => f.id === floorId ? updatedFloor : f),
      };
      patchState(store, state => ({
        ...state,
        projects: state.projects.map(p => p.id === projectId ? updatedProject : p),
      }));

      const db = await storage.openWriteStore<Project>('projects');
      await db.update(updatedProject);
      console.log('added furniture to floor', updatedProject);
    },
    async updateFurniture(projectId: Project['id'], floorId: ApartmentFloor['id'], furniture: Furniture): Promise<void> {
      const existingProject = store.projects().find(p => p.id === projectId);
      if (!existingProject) {
        throw new Error(`Project with id ${projectId} not found`);
      }
      const existingFloor = existingProject.floors.find(f => f.id === floorId);
      if (!existingFloor) {
        throw new Error(`Floor with id ${floorId} not found`);
      }
      const updatedFloor: ApartmentFloor = {
        ...existingFloor,
        furniture: existingFloor.furniture.map(f => f.id === furniture.id ? furniture : f),
      };
      const updatedProject: Project = {
        ...existingProject,
        floors: existingProject.floors.map(f => f.id === floorId ? updatedFloor : f),
      };
      patchState(store, state => ({
        ...state,
        projects: state.projects.map(p => p.id === projectId ? updatedProject : p),
      }));
      const db = await storage.openWriteStore<Project>('projects');
      await db.update(updatedProject);
      console.log('updated furniture in floor', updatedProject);
    },
    async removeFurniture(projectId: Project['id'], floorId: ApartmentFloor['id'], furnitureId: Furniture['id']): Promise<void> {
      const existingProject = store.projects().find(p => p.id === projectId);
      if (!existingProject) {
        throw new Error(`Project with id ${projectId} not found`);
      }
      const existingFloor = existingProject.floors.find(f => f.id === floorId);
      if (!existingFloor) {
        throw new Error(`Floor with id ${floorId} not found`);
      }
      const updatedFloor: ApartmentFloor = {
        ...existingFloor,
        furniture: existingFloor.furniture.filter(f => f.id !== furnitureId),
      };
      const updatedProject: Project = {
        ...existingProject,
        floors: existingProject.floors.map(f => f.id === floorId ? updatedFloor : f),
      };
      patchState(store, state => ({
        ...state,
        projects: state.projects.map(p => p.id === projectId ? updatedProject : p),
      }));
      const db = await storage.openWriteStore<Project>('projects');
      await db.update(updatedProject);
      console.log('removed furniture from floor', updatedProject);
    },
  })),
  withHooks({
    async onInit(store) {
      const storage = inject(StorageService);
      const db = await storage.openReadStore<Project>('projects');
      const projects = await db.queryAll();
      patchState(store, state => ({
        ...state,
        projects,
      }));
    },
  }),
);
