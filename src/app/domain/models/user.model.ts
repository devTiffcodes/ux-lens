export type UserRole = 'participant' | 'researcher';

export interface AppUser {

  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  role: UserRole;
}
