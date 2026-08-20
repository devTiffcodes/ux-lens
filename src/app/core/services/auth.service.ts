import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../data/services/firebase.service';
import { AppUser, UserRole } from '../../domain/models/user.model';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly firebaseService = inject(FirebaseService);
  private readonly router = inject(Router);

  readonly currentUser = signal<AppUser | null>(null);
  readonly isLoading = signal<boolean>(true);

  readonly isLoggedIn = computed(() => !!this.currentUser());
  readonly isResearcher = computed(() => this.currentUser()?.role === 'researcher');
  readonly isParticipant = computed(() => this.currentUser()?.role === 'participant');

  constructor() {
    // Listen to Firebase auth state
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      onAuthStateChanged(this.firebaseService.auth, async (firebaseUser) => {
        if (firebaseUser) {
          const appUser = await this.loadOrCreateUser(firebaseUser);
          this.currentUser.set(appUser);
        } else {
          this.currentUser.set(null);
        }
        this.isLoading.set(false);
      });
    });
  }

  async signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(this.firebaseService.auth, provider);
    const appUser = await this.loadOrCreateUser(credential.user);
    this.currentUser.set(appUser);

    if (appUser.role === 'researcher') {
      this.router.navigate(['/mera/home']);
    } else {
      this.router.navigate(['/mera/home']);
    }
  }

  async signOut(): Promise<void> {
    await signOut(this.firebaseService.auth);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  private async loadOrCreateUser(firebaseUser: any): Promise<AppUser> {
    const userRef = doc(this.firebaseService.db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? '',
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: data['role'] as UserRole,
      };
    }

    // New user — assign participant role by default
    const newUser: AppUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      role: 'participant',
    };

    await setDoc(userRef, newUser);
    return newUser;
  }
}
