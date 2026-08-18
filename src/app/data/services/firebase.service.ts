import { Injectable, signal } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  Auth,
  getAuth,
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  Firestore,
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  QueryConstraint,
  DocumentData,
  CollectionReference,
} from 'firebase/firestore';
import { environment } from '../../../environments/environment';

/**
 * FirebaseService
 *
 * Thin, framework-agnostic wrapper around the Firebase JS SDK (modular v9+ API).
 * Repositories depend on this service rather than talking to the Firebase SDK
 * directly, keeping `data/repositories` as the only layer that needs to know
 * about Firestore/Auth specifics (clean architecture boundary).
 */
@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private readonly app: FirebaseApp;
  private readonly firestore: Firestore;
  private readonly firebaseAuth: Auth;

  /** Reactive current user signal — updated by the Auth state listener below. */
  readonly currentUser = signal<User | null>(null);
  readonly authReady = signal<boolean>(false);

  constructor() {
    this.app = initializeApp(environment.firebaseConfig);
    this.firestore = getFirestore(this.app);
    this.firebaseAuth = getAuth(this.app);

    onAuthStateChanged(this.firebaseAuth, (user) => {
      this.currentUser.set(user);
      this.authReady.set(true);
    });
  }

  // ---------------------------------------------------------------------
  // Accessors
  // ---------------------------------------------------------------------

  get db(): Firestore {
    return this.firestore;
  }

  get auth(): Auth {
    return this.firebaseAuth;
  }

  // ---------------------------------------------------------------------
  // Auth helpers
  // ---------------------------------------------------------------------

  async signIn(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    );
    return credential.user;
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(this.firebaseAuth);
  }

  isLoggedIn(): boolean {
    return this.firebaseAuth.currentUser !== null;
  }

  // ---------------------------------------------------------------------
  // Firestore generic helpers
  // ---------------------------------------------------------------------

  /**
   * Returns a typed collection reference for the given collection name.
   * Repositories call this instead of importing `collection()` directly.
   */
  getCollection<T = DocumentData>(collectionName: string): CollectionReference<T> {
    return collection(this.firestore, collectionName) as CollectionReference<T>;
  }

  /**
   * Adds a document to a collection and returns the generated document ID.
   */
  async addDocument<T extends DocumentData>(
    collectionName: string,
    data: T
  ): Promise<string> {
    const ref = await addDoc(this.getCollection<T>(collectionName), data);
    return ref.id;
  }

  /**
   * Fetches all documents in a collection, optionally filtered/ordered
   * by the given query constraints (e.g. where(), orderBy()).
   */
  async getDocuments<T = DocumentData>(
    collectionName: string,
    constraints: QueryConstraint[] = []
  ): Promise<T[]> {
    const q = query(this.getCollection<T>(collectionName), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
  }

  // Re-exported so repositories can build constraints without importing
  // firebase/firestore directly everywhere.
  static where = where;
  static orderBy = orderBy;
}
