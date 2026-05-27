import { create } from 'zustand';
import { Assignment, DashboardStats, Priority } from '../types';
import { isPast, parseISO } from 'date-fns';

interface AssignmentState {
  assignments: Assignment[];
  isLoading: boolean;
  error: string | null;
  priorityFilter: Priority | 'All';
  searchQuery: string;

  setAssignments: (assignments: Assignment[]) => void;
  addAssignment: (assignment: Assignment) => void;
  updateAssignment: (id: string, data: Partial<Assignment>) => void;
  removeAssignment: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPriorityFilter: (filter: Priority | 'All') => void;
  setSearchQuery: (query: string) => void;

  // Derived selectors
  getFilteredAssignments: () => Assignment[];
  getDashboardStats: () => DashboardStats;
  getUpcomingAssignments: () => Assignment[];
  getOverdueAssignments: () => Assignment[];
}

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  assignments: [],
  isLoading: false,
  error: null,
  priorityFilter: 'All',
  searchQuery: '',

  setAssignments: (assignments) => set({ assignments }),

  addAssignment: (assignment) =>
    set((state) => ({ assignments: [...state.assignments, assignment] })),

  updateAssignment: (id, data) =>
    set((state) => ({
      assignments: state.assignments.map((a) =>
        a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a
      ),
    })),

  removeAssignment: (id) =>
    set((state) => ({ assignments: state.assignments.filter((a) => a.id !== id) })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setPriorityFilter: (priorityFilter) => set({ priorityFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  getFilteredAssignments: () => {
    const { assignments, priorityFilter, searchQuery } = get();
    return assignments.filter((a) => {
      const matchesPriority = priorityFilter === 'All' || a.priority === priorityFilter;
      const matchesSearch =
        searchQuery === '' ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.subject.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPriority && matchesSearch;
    });
  },

  getDashboardStats: (): DashboardStats => {
    const { assignments } = get();
    const total = assignments.length;
    const completed = assignments.filter((a) => a.status === 'Completed').length;
    const overdue = assignments.filter(
      (a) => a.status === 'Pending' && isPast(parseISO(a.dueDate))
    ).length;
    const pending = total - completed;
    const completionPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, pending, overdue, completionPercentage };
  },

  getUpcomingAssignments: () => {
    const { assignments } = get();
    return assignments
      .filter((a) => a.status === 'Pending' && !isPast(parseISO(a.dueDate)))
      .slice(0, 5);
  },

  getOverdueAssignments: () => {
    const { assignments } = get();
    return assignments.filter(
      (a) => a.status === 'Pending' && isPast(parseISO(a.dueDate))
    );
  },
}));
