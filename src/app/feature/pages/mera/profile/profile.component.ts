import { Component, inject } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { UxModeService } from '../../../../core/services/ux-mode.service';
import { ProfileService } from '../../../../core/services/mera/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  protected readonly authService = inject(AuthService);
  protected readonly uxMode = inject(UxModeService);
  protected readonly profileService = inject(ProfileService);

  protected readonly notificationKeys = [
    'email',
    'sms',
    'announcements',
    'events',
  ] as const;

  protected startEditing(): void {
    this.profileService.startEditing();
  }

  protected cancelEditing(): void {
    this.profileService.cancelEditing();
  }

  protected saveChanges(): void {
    this.profileService.saveChanges();
  }

  protected updateField(field: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.profileService.updateDraftField(field as any, value);
  }

  protected toggleNotification(key: typeof this.notificationKeys[number]): void {
    this.profileService.toggleNotification(key);
  }

  protected onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.profileService.handleAvatarUpload(file);
  }

  protected async signOut(): Promise<void> {
    await this.authService.signOut();
  }

  protected getAvatarDisplay(): string {
    return this.profileService.avatarPreview()
      ? ''
      : this.profileService.profile().avatarInitial;
  }

  // ── Quick actions ────────────────────────────────────────────────

  protected downloadStudentId(): void {
    this.profileService.showToast('📄 Preparing your Student ID for download...');
  }

  protected viewTranscript(): void {
    this.profileService.showToast('📋 Academic Transcript is being generated...');
  }

  protected viewFeeStatement(): void {
    this.profileService.showToast('💰 Fee Statement is being loaded...');
  }

  protected changePassword(): void {
    this.profileService.showToast('🔑 A password reset link has been sent to your email.');
  }
}
