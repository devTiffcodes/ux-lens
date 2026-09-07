import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    const check = () => {
      if (!authService.isLoading()) {
        if (authService.isLoggedIn()) {
          resolve(true);
        } else {
          router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
          resolve(false);
        }
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  });
};
