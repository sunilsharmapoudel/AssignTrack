// ─── Assignment ───────────────────────────────────────────────────────────────

export type Priority = 'High' | 'Medium' | 'Low';
export type AssignmentStatus = 'Pending' | 'Completed';

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;           // ISO 8601 string
  priority: Priority;
  status: AssignmentStatus;
  notes: string;
  imageUri?: string;         // optional photo attachment
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export type AssignmentFormData = Omit<Assignment, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;

// ─── User / Auth ──────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  university?: string;
  course?: string;
  createdAt: string;
}

// ─── Study Location ───────────────────────────────────────────────────────────

export interface StudyLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  userId: string;
  createdAt: string;
}

// ─── Notification Preferences ─────────────────────────────────────────────────

export interface NotificationPreferences {
  deadlineReminder: boolean;
  reminderHoursBefore: number;
  dailyReminder: boolean;
  dailyReminderTime: string;   // "HH:mm"
  overdueAlert: boolean;
}

// ─── Notes (AI Speech) ────────────────────────────────────────────────────────

export interface Note {
  id: string;
  title: string;
  content: string;
  audioUri?: string;
  assignmentId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  biometricEnabled: boolean;
  notificationPreferences: NotificationPreferences;
}

// ─── Battery ──────────────────────────────────────────────────────────────────

export interface BatteryInfo {
  level: number;           // 0–1
  state: string;
  lowPowerMode: boolean;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionPercentage: number;
}

// ─── Sync ─────────────────────────────────────────────────────────────────────

export type SyncStatus = 'synced' | 'pending' | 'error';

export interface SyncRecord {
  id: string;
  operation: 'create' | 'update' | 'delete';
  table: string;
  data: string;           // JSON stringified
  syncStatus: SyncStatus;
  createdAt: string;
}
