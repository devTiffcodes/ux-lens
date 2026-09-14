import { Injectable, signal } from '@angular/core';

export interface StudentProfile {
  displayName: string;
  email: string;
  phone: string;
  studentNumber: string;
  programme: string;
  faculty: string;
  campus: string;
  semester: string;
  status: string;
  avatarInitial: string;
  avatarColor: string;
  notifications: {
    email: boolean;
    sms: boolean;
    announcements: boolean;
    events: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  readonly profile = signal<StudentProfile>({
    displayName: 'Tiffania',
    email: 'tiffania@student.unisey.ac.sc',
    phone: '+248 2 500 000',
    studentNumber: 'UNI-2024-1038',
    programme: 'Diploma in Computing and IT',
    faculty: 'Arts and Social Development',
    campus: 'Mont Fleuri',
    semester: 'Semester 2 · 2026',
    status: 'Active',
    avatarInitial: 'T',
    avatarColor: '#3B5998',
    notifications: {
      email: true,
      sms: false,
      announcements: true,
      events: true,
    },
  });

  readonly isEditing = signal(false);
  readonly toastMessage = signal<string | null>(null);
  readonly avatarPreview = signal<string | null>(null);

  // Editable draft — only committed on save
  readonly draft = signal<Partial<StudentProfile>>({});

  startEditing(): void {
    this.draft.set({
      displayName: this.profile().displayName,
      phone: this.profile().phone,
      notifications: { ...this.profile().notifications },
    });
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
    this.draft.set({});
  }

  saveChanges(): void {
    const d = this.draft();
    this.profile.update(p => ({
      ...p,
      displayName: d.displayName ?? p.displayName,
      phone: d.phone ?? p.phone,
      notifications: d.notifications ?? p.notifications,
      avatarInitial: (d.displayName ?? p.displayName).charAt(0).toUpperCase(),
    }));
    this.isEditing.set(false);
    this.draft.set({});
    this.showToast('✅ Profile updated successfully.');
  }

  updateDraftField(field: keyof StudentProfile, value: string): void {
    this.draft.update(d => ({ ...d, [field]: value }));
  }

  toggleNotification(key: keyof StudentProfile['notifications']): void {
    this.draft.update(d => ({
      ...d,
      notifications: {
        ...(d.notifications ?? this.profile().notifications),
        [key]: !(d.notifications ?? this.profile().notifications)[key],
      },
    }));
  }

  handleAvatarUpload(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.showToast('❌ Please upload a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      this.avatarPreview.set(e.target?.result as string);
      this.showToast('✅ Profile photo updated.');
    };
    reader.readAsDataURL(file);
  }

  showToast(message: string): void {
    this.toastMessage.set(message);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
