import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FirebaseService } from '../../data/services/firebase.service';

/**
 * Protects the Dashboard route. Uses FirebaseService's reactive
 * `authReady`/`currentUser` signals rather than the raw Firebase Auth
 * instance, so it correctly waits for Firebase's async auth state check
 * to resolve before deciding (avoids a false redirect on page refresh,
 * when Firebase hasn't yet confirmed whether a session exists).
 */
export const authGuard: CanActivateFn = () => {
  const firebaseService = inject(FirebaseService);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    const checkAuth = () => {
      if (firebaseService.authReady()) {
        if (firebaseService.currentUser()) {
          resolve(true);
        } else {
          router.navigate(['/home']);
          resolve(false);
        }
      } else {
        // Auth state not yet resolved — check again shortly.
        setTimeout(checkAuth, 50);
      }
    };

    checkAuth();
  });
};
