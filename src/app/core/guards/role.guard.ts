import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../domain/models/user.model';

export const roleGuard = (requiredRole: UserRole): CanActivateFn => () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    const check = () => {
      if (!authService.isLoading()) {
        if (authService.currentUser()?.role === requiredRole) {
          resolve(true);
        } else {
          router.navigate(['/mera/home']);
          resolve(false);
        }
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  });
};
