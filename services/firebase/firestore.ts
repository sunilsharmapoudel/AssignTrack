import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import { Assignment, StudyLocation, NotificationPreferences, Note } from '../../types';

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

// ─── Assignments ──────────────────────────────────────────────────────────────

export async function createAssignment(
  data: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'assignments'), {
    ...stripUndefined(data),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateAssignment(
  id: string,
  data: Partial<Assignment>
): Promise<void> {
  await updateDoc(doc(db, 'assignments', id), {
    ...stripUndefined(data),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAssignment(id: string): Promise<void> {
  await deleteDoc(doc(db, 'assignments', id));
}

export async function getAssignmentsByUser(userId: string): Promise<Assignment[]> {
  const q = query(
    collection(db, 'assignments'),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  const assignments = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: (d.data().createdAt as Timestamp)?.toDate?.().toISOString() ?? '',
    updatedAt: (d.data().updatedAt as Timestamp)?.toDate?.().toISOString() ?? '',
  })) as Assignment[];
  return assignments.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export async function getAssignmentById(id: string): Promise<Assignment | null> {
  const snap = await getDoc(doc(db, 'assignments', id));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toDate?.().toISOString() ?? '',
    updatedAt: (data.updatedAt as Timestamp)?.toDate?.().toISOString() ?? '',
  } as Assignment;
}

// Real-time subscription — returns unsubscribe function.
// Sorts client-side to avoid requiring a composite Firestore index.
export function subscribeToAssignments(
  userId: string,
  callback: (assignments: Assignment[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'assignments'),
    where('userId', '==', userId)
  );
  return onSnapshot(q, (snap) => {
    const assignments = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: (d.data().createdAt as Timestamp)?.toDate?.().toISOString() ?? '',
      updatedAt: (d.data().updatedAt as Timestamp)?.toDate?.().toISOString() ?? '',
    })) as Assignment[];
    assignments.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    callback(assignments);
  });
}

// ─── Study Locations ──────────────────────────────────────────────────────────

export async function saveStudyLocation(
  data: Omit<StudyLocation, 'id' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'studyLocations'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getStudyLocations(userId: string): Promise<StudyLocation[]> {
  const q = query(
    collection(db, 'studyLocations'),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  const locations = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: (d.data().createdAt as Timestamp)?.toDate?.().toISOString() ?? '',
  })) as StudyLocation[];
  return locations.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteStudyLocation(id: string): Promise<void> {
  await deleteDoc(doc(db, 'studyLocations', id));
}

// ─── Notification Preferences ─────────────────────────────────────────────────

export async function saveNotificationPrefs(
  userId: string,
  prefs: NotificationPreferences
): Promise<void> {
  await setDoc(doc(db, 'notificationPrefs', userId), prefs, { merge: true });
}

export async function getNotificationPrefs(
  userId: string
): Promise<NotificationPreferences | null> {
  const snap = await getDoc(doc(db, 'notificationPrefs', userId));
  return snap.exists() ? (snap.data() as NotificationPreferences) : null;
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export async function createNote(
  data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'notes'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateNote(id: string, data: Partial<Note>): Promise<void> {
  await updateDoc(doc(db, 'notes', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteNote(id: string): Promise<void> {
  await deleteDoc(doc(db, 'notes', id));
}

export async function getNotesByUser(userId: string): Promise<Note[]> {
  const q = query(
    collection(db, 'notes'),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  const notes = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: (d.data().createdAt as Timestamp)?.toDate?.().toISOString() ?? '',
    updatedAt: (d.data().updatedAt as Timestamp)?.toDate?.().toISOString() ?? '',
  })) as Note[];
  return notes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
