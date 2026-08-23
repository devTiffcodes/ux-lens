import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);

  protected readonly isLoading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly showRegister = signal(false);
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly displayName = signal('');

  protected onEmailInput(e: Event): void {
    this.email.set((e.target as HTMLInputElement).value);
  }

  protected onPasswordInput(e: Event): void {
    this.password.set((e.target as HTMLInputElement).value);
  }

  protected onNameInput(e: Event): void {
    this.displayName.set((e.target as HTMLInputElement).value);
  }

  protected async signInWithGoogle(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      await this.authService.signInWithGoogle();
    } catch {
      this.error.set('Google sign in failed. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async signInWithEmail(): Promise<void> {
    if (!this.email() || !this.password()) {
      this.error.set('Please enter your email and password.');
      return;
    }
    this.isLoading.set(true);
    this.error.set(null);
    try {
      await this.authService.signInWithEmail(this.email(), this.password());
    } catch {
      this.error.set('Invalid email or password.');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async registerWithEmail(): Promise<void> {
    if (!this.email() || !this.password() || !this.displayName()) {
      this.error.set('Please fill in all fields.');
      return;
    }
    if (this.password().length < 6) {
      this.error.set('Password must be at least 6 characters.');
      return;
    }
    this.isLoading.set(true);
    this.error.set(null);
    try {
      await this.authService.registerWithEmail(this.email(), this.password(), this.displayName());
    } catch (err: any) {
      this.error.set(err.message ?? 'Registration failed. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
