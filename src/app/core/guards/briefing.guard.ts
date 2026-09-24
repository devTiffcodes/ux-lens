import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const briefingGuard: CanActivateFn = () => {
  const router = inject(Router);
  const accepted = localStorage.getItem('briefing_accepted') === 'true';

  if (!accepted) {
    router.navigate(['/mera/briefing']);
    return false;
  }

  return true;
};
