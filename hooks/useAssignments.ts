import { useCallback, useEffect } from 'react';
import { useAssignmentStore } from '../store/assignmentStore';
import { useAuthStore } from '../store/authStore';
import { Assignment, AssignmentFormData } from '../types';
import {
  createAssignment as fsCreate,
  updateAssignment as fsUpdate,
  deleteAssignment as fsDelete,
  subscribeToAssignments,
} from '../services/firebase/firestore';
import {
  localUpsertAssignment,
  localUpdateAssignment,
  localDeleteAssignment,
  localGetAssignments,
} from '../services/sqlite/assignmentQueries';
import { isOnline } from '../services/network/connectivityService';
import { scheduleDeadlineReminder, cancelNotification } from '../services/notifications/notificationService';
import { useSettingsStore } from '../store/settingsStore';

export function useAssignments() {
  const store = useAssignmentStore();
  const { user } = useAuthStore();
  const { notificationPreferences } = useSettingsStore();

  // Real-time sync: load SQLite cache immediately, then subscribe to Firestore changes.
  // onSnapshot fires on the calling device too, so cross-device sync is automatic.
  useEffect(() => {
    if (!user) return;

    store.setLoading(true);

    // Show cached SQLite data instantly while Firestore connects
    localGetAssignments(user.uid)
      .then((local) => {
        if (local.length > 0) {
          store.setAssignments(local);
          store.setLoading(false);
        }
      })
      .catch(() => store.setLoading(false));

    const unsubscribe = subscribeToAssignments(user.uid, async (assignments) => {
      try {
        await Promise.all(assignments.map((a) => localUpsertAssignment(a)));
        store.setAssignments(assignments);
      } catch (err: any) {
        store.setError(err.message);
      } finally {
        store.setLoading(false);
      }
    });

    return unsubscribe;
  // store actions are stable Zustand references — only re-subscribe on user change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // Manual refresh for pull-to-refresh scenarios
  const loadAssignments = useCallback(async () => {
    if (!user) return;
    store.setLoading(true);
    try {
      const [localAssignments, online] = await Promise.all([
        localGetAssignments(user.uid),
        isOnline(),
      ]);
      store.setAssignments(localAssignments);
      if (online) {
        const { getAssignmentsByUser } = await import('../services/firebase/firestore');
        const cloudAssignments = await getAssignmentsByUser(user.uid);
        await Promise.all(cloudAssignments.map((a) => localUpsertAssignment(a)));
        store.setAssignments(cloudAssignments);
      }
    } catch (err: any) {
      store.setError(err.message);
    } finally {
      store.setLoading(false);
    }
  }, [user, store]);

  const createAssignment = useCallback(
    async (data: AssignmentFormData): Promise<string> => {
      if (!user) throw new Error('Not authenticated');

      const now = new Date().toISOString();
      const online = await isOnline();

      let id: string;
      const assignment: Assignment = {
        id: '', // placeholder
        ...data,
        userId: user.uid,
        createdAt: now,
        updatedAt: now,
      };

      if (online) {
        id = await fsCreate({ ...data, userId: user.uid });
        assignment.id = id;
        // onSnapshot will update the store — don't also call addAssignment
        // or the item appears twice while the snapshot is in flight
        await localUpsertAssignment(assignment);
      } else {
        id = `local_${Date.now()}`;
        assignment.id = id;
        await localUpsertAssignment(assignment);
        store.addAssignment(assignment); // no subscription when offline, so add manually
      }

      // Schedule deadline reminder if permissions are granted
      if (notificationPreferences.deadlineReminder) {
        await scheduleDeadlineReminder(assignment, notificationPreferences.reminderHoursBefore);
      }

      return id;
    },
    [user, store, notificationPreferences]
  );

  const updateAssignment = useCallback(
    async (id: string, data: Partial<AssignmentFormData>) => {
      const online = await isOnline();
      const updated = { ...data, updatedAt: new Date().toISOString() };

      if (online) {
        await fsUpdate(id, updated);
      } else {
        await localUpdateAssignment(id, updated);
      }

      store.updateAssignment(id, updated);
    },
    [store]
  );

  const deleteAssignment = useCallback(
    async (id: string) => {
      const online = await isOnline();

      if (online) {
        await fsDelete(id);
      }
      await localDeleteAssignment(id);
      store.removeAssignment(id);
    },
    [store]
  );

  const markComplete = useCallback(
    async (id: string) => {
      await updateAssignment(id, { status: 'Completed' });
    },
    [updateAssignment]
  );

  const markIncomplete = useCallback(
    async (id: string) => {
      await updateAssignment(id, { status: 'Pending' });
    },
    [updateAssignment]
  );

  return {
    assignments: store.assignments,
    filteredAssignments: store.getFilteredAssignments(),
    dashboardStats: store.getDashboardStats(),
    upcomingAssignments: store.getUpcomingAssignments(),
    overdueAssignments: store.getOverdueAssignments(),
    isLoading: store.isLoading,
    error: store.error,
    priorityFilter: store.priorityFilter,
    searchQuery: store.searchQuery,
    setPriorityFilter: store.setPriorityFilter,
    setSearchQuery: store.setSearchQuery,
    loadAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    markComplete,
    markIncomplete,
  };
}
