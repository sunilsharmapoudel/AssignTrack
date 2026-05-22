// ─── Auth Validators ──────────────────────────────────────────────────────────

export function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Enter a valid email address';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
}

export function validateDisplayName(name: string): string | null {
  if (!name.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  return null;
}

// ─── Assignment Validators ────────────────────────────────────────────────────

export function validateAssignmentTitle(title: string): string | null {
  if (!title.trim()) return 'Title is required';
  if (title.trim().length > 100) return 'Title must be under 100 characters';
  return null;
}

export function validateAssignmentSubject(subject: string): string | null {
  if (!subject.trim()) return 'Subject is required';
  return null;
}

export function validateAssignmentDueDate(dueDate: string): string | null {
  if (!dueDate) return 'Due date is required';
  const date = new Date(dueDate);
  if (isNaN(date.getTime())) return 'Enter a valid date';
  return null;
}

export interface AssignmentErrors {
  title?: string;
  subject?: string;
  dueDate?: string;
}

export function validateAssignmentForm(data: {
  title: string;
  subject: string;
  dueDate: string;
}): AssignmentErrors {
  const errors: AssignmentErrors = {};
  const titleErr = validateAssignmentTitle(data.title);
  const subjectErr = validateAssignmentSubject(data.subject);
  const dateErr = validateAssignmentDueDate(data.dueDate);
  if (titleErr) errors.title = titleErr;
  if (subjectErr) errors.subject = subjectErr;
  if (dateErr) errors.dueDate = dateErr;
  return errors;
}
