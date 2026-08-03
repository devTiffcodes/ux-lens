import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../../data/services/firebase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly firebaseService = inject(FirebaseService);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly loginError = signal<string | null>(null);

  protected readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.loginError.set(null);

    const { email, password } = this.loginForm.getRawValue();

    try {
      await this.firebaseService.signIn(email, password);
      this.router.navigate(['/dashboard']);
    } catch {
      this.loginError.set('Invalid email or password.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
