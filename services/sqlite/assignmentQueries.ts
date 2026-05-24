import { getDatabase } from './database';
import { Assignment, StudyLocation, Note } from '../../types';

// ─── Assignments ──────────────────────────────────────────────────────────────

export async function localGetAssignments(userId: string): Promise<Assignment[]> {
  const db = await getDatabase();
  return db.getAllAsync<Assignment>(
    'SELECT * FROM assignments WHERE userId = ? ORDER BY dueDate ASC',
    [userId]
  );
}

export async function localGetAssignmentById(id: string): Promise<Assignment | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Assignment>('SELECT * FROM assignments WHERE id = ?', [id]);
}

export async function localUpsertAssignment(assignment: Assignment): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO assignments
      (id, title, subject, description, dueDate, priority, status, notes, imageUri, userId, createdAt, updatedAt, syncStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      assignment.id,
      assignment.title,
      assignment.subject,
      assignment.description,
      assignment.dueDate,
      assignment.priority,
      assignment.status,
      assignment.notes,
      assignment.imageUri ?? null,
      assignment.userId,
      assignment.createdAt,
      assignment.updatedAt,
      'synced',
    ]
  );
}

export async function localUpdateAssignment(
  id: string,
  data: Partial<Assignment>
): Promise<void> {
  const db = await getDatabase();
  const sets = Object.keys(data).map((k) => `${k} = ?`).join(', ');
  const values = [...Object.values(data), 'pending', id];
  await db.runAsync(
    `UPDATE assignments SET ${sets}, syncStatus = ? WHERE id = ?`,
    values
  );
}

export async function localDeleteAssignment(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM assignments WHERE id = ?', [id]);
}

export async function localGetPendingSyncAssignments(): Promise<Assignment[]> {
  const db = await getDatabase();
  return db.getAllAsync<Assignment>(
    "SELECT * FROM assignments WHERE syncStatus = 'pending'"
  );
}

// ─── Study Locations ──────────────────────────────────────────────────────────

export async function localGetStudyLocations(userId: string): Promise<StudyLocation[]> {
  const db = await getDatabase();
  return db.getAllAsync<StudyLocation>(
    'SELECT * FROM study_locations WHERE userId = ? ORDER BY createdAt DESC',
    [userId]
  );
}

export async function localUpsertStudyLocation(location: StudyLocation): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO study_locations
      (id, name, latitude, longitude, description, userId, createdAt, syncStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      location.id, location.name, location.latitude, location.longitude,
      location.description ?? null, location.userId, location.createdAt, 'synced',
    ]
  );
}

export async function localDeleteStudyLocation(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM study_locations WHERE id = ?', [id]);
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export async function localGetNotes(userId: string): Promise<Note[]> {
  const db = await getDatabase();
  return db.getAllAsync<Note>(
    'SELECT * FROM notes WHERE userId = ? ORDER BY updatedAt DESC',
    [userId]
  );
}

export async function localUpsertNote(note: Note): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO notes
      (id, title, content, audioUri, assignmentId, userId, createdAt, updatedAt, syncStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      note.id, note.title, note.content, note.audioUri ?? null,
      note.assignmentId ?? null, note.userId, note.createdAt, note.updatedAt, 'synced',
    ]
  );
}

export async function localDeleteNote(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
}
