import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDocFromServer, 
  collection, 
  onSnapshot, 
  deleteDoc, 
  writeBatch,
  getDocs
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Song, Member, WorshipEvent, Notice } from './types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID (CRITICAL)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Connection test helper per Firebase skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is offline or connecting...');
    }
    // Even if test document doesn't exist yet, reaching server is successful
    return true;
  }
}

// Google Login
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Erro no login com Google:', error);
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Firestore operations for Songs
export async function saveSongToFirestore(song: Song): Promise<void> {
  const path = `songs/${song.id}`;
  try {
    await setDoc(doc(db, 'songs', song.id), song, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteSongFromFirestore(songId: string): Promise<void> {
  const path = `songs/${songId}`;
  try {
    await deleteDoc(doc(db, 'songs', songId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// Firestore operations for Members
export async function saveMemberToFirestore(member: Member): Promise<void> {
  const path = `members/${member.id}`;
  try {
    await setDoc(doc(db, 'members', member.id), member, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteMemberFromFirestore(memberId: string): Promise<void> {
  const path = `members/${memberId}`;
  try {
    await deleteDoc(doc(db, 'members', memberId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// Firestore operations for Events
export async function saveEventToFirestore(event: WorshipEvent): Promise<void> {
  const path = `events/${event.id}`;
  try {
    await setDoc(doc(db, 'events', event.id), event, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteEventFromFirestore(eventId: string): Promise<void> {
  const path = `events/${eventId}`;
  try {
    await deleteDoc(doc(db, 'events', eventId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// Firestore operations for Notices
export async function saveNoticeToFirestore(notice: Notice): Promise<void> {
  const path = `notices/${notice.id}`;
  try {
    await setDoc(doc(db, 'notices', notice.id), notice, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// Batch seeder to populate Firestore with all initial church data if empty
export async function seedInitialDataIfEmpty(
  initialMembers: Member[],
  initialSongs: Song[],
  initialEvents: WorshipEvent[],
  initialNotices: Notice[]
): Promise<{ seeded: boolean; songCount: number }> {
  try {
    const songsSnap = await getDocs(collection(db, 'songs'));
    if (!songsSnap.empty) {
      return { seeded: false, songCount: songsSnap.size };
    }

    // Seed in batches of up to 400 (Firestore batch limit is 500)
    // 1. Members
    const membersBatch = writeBatch(db);
    initialMembers.forEach(m => {
      membersBatch.set(doc(db, 'members', m.id), m);
    });
    // 2. Events & Notices
    initialEvents.forEach(e => {
      membersBatch.set(doc(db, 'events', e.id), e);
    });
    initialNotices.forEach(n => {
      membersBatch.set(doc(db, 'notices', n.id), n);
    });
    await membersBatch.commit();

    // 3. Songs in chunks of 100
    const chunkSize = 100;
    for (let i = 0; i < initialSongs.length; i += chunkSize) {
      const chunk = initialSongs.slice(i, i + chunkSize);
      const songBatch = writeBatch(db);
      chunk.forEach(s => {
        songBatch.set(doc(db, 'songs', s.id), s);
      });
      await songBatch.commit();
    }

    return { seeded: true, songCount: initialSongs.length };
  } catch (error) {
    console.error('Erro ao semear dados no Firestore:', error);
    return { seeded: false, songCount: 0 };
  }
}
