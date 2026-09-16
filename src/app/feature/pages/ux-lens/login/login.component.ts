import { Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly isLoading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly showRegister = signal(false);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly displayName = signal('');

  /**
   * UX Lens is the researcher/developer side of the application.
   *
   * Therefore the default destination after a successful login
   * is the UX Lens Dashboard.
   *
   * A returnUrl is still respected when the user was redirected
   * here by an authenticated route.
   */
  private redirectAfterLogin(): void {
    const returnUrl =
      this.route.snapshot.queryParamMap.get('returnUrl');

    const destination =
      returnUrl && returnUrl.startsWith('/')
        ? returnUrl
        : '/dashboard';

    this.router.navigateByUrl(destination);
  }

  protected onEmailInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.email.set(value);
  }

  protected onPasswordInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.password.set(value);
  }

  protected onNameInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.displayName.set(value);
  }

  protected async signInWithGoogle(): Promise<void> {
    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      await this.authService.signInWithGoogle();

      this.redirectAfterLogin();
    } catch (error) {
      console.error('Google sign in failed:', error);

      this.error.set(
        'Google sign in failed. Please try again.'
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async signInWithEmail(): Promise<void> {
    if (!this.email() || !this.password()) {
      this.error.set(
        'Please enter your email and password.'
      );

      return;
    }

    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      await this.authService.signInWithEmail(
        this.email(),
        this.password()
      );

      this.redirectAfterLogin();
    } catch (error) {
      console.error('Email sign in failed:', error);

      this.error.set(
        'Invalid email or password.'
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async registerWithEmail(): Promise<void> {
    if (
      !this.email() ||
      !this.password() ||
      !this.displayName()
    ) {
      this.error.set(
        'Please fill in all fields.'
      );

      return;
    }

    if (this.password().length < 6) {
      this.error.set(
        'Password must be at least 6 characters.'
      );

      return;
    }

    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      await this.authService.registerWithEmail(
        this.email(),
        this.password(),
        this.displayName()
      );

      this.redirectAfterLogin();
    } catch (error: any) {
      console.error('Registration failed:', error);

      this.error.set(
        error?.message ??
        'Registration failed. Please try again.'
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
