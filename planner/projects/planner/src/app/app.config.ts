import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideStorage } from './storage/provide-storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideStorage({
      dbName: 'planner',
      migrations: [
        {
          tables: [
            {
              name: 'projects',
              autoIncrement: false,
              keyPath: 'id',
            },
            {
              name: 'plans',
              autoIncrement: false,
              keyPath: 'id',
            },
          ],
        },
      ],
    }),
  ],
};
