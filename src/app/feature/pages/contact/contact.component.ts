import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UxModeService } from '../../../core/services/ux-mode.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  protected readonly uxModeService = inject(UxModeService);
  private readonly fb = inject(FormBuilder);

  protected readonly submitted = signal<boolean>(false);
  protected readonly showSuccess = signal<boolean>(false);

  protected readonly contactForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required],
  });

  protected onSubmit(): void {
    this.submitted.set(true);

    // Poor UX mode: submit regardless of validity, no feedback either way —
    // this is the intentional "no form validation feedback" issue.
    if (this.uxModeService.isPoorMode()) {
      this.contactForm.reset();
      return;
    }

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.showSuccess.set(true);
    this.contactForm.reset();
    this.submitted.set(false);
  }

  protected fieldInvalid(fieldName: 'name' | 'email' | 'message'): boolean {
    if (this.uxModeService.isPoorMode()) {
      return false;
    }
    const control = this.contactForm.get(fieldName);
    return !!control && control.invalid && (control.touched || this.submitted());
  }
}
