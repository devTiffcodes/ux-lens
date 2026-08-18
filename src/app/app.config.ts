import {
  ApplicationConfig,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';

/**
 * Application-wide providers.
 *
 * Firebase itself needs no Angular provider here — FirebaseService
 * initializes the app directly in its constructor (see firebase.service.ts),
 * so there's no AngularFire-style provideFirebaseApp()/provideFirestore()
 * boilerplate required.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
  ],
};
