import React, { useEffect, useCallback } from 'react';
import {
  View, FlatList, StyleSheet, TouchableOpacity, Text, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAssignments } from '../../hooks/useAssignments';
import { useShakeDetection } from '../../hooks/useSensors';
import { AssignmentCard } from '../../components/assignments/AssignmentCard';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Badge } from '../../components/ui/Badge';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';
import type { Priority } from '../../types';

const FILTERS: (Priority | 'All')[] = ['All', 'High', 'Medium', 'Low'];

export default function AssignmentsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const {
    filteredAssignments, isLoading, loadAssignments,
    markComplete, markIncomplete, deleteAssignment,
    priorityFilter, setPriorityFilter,
    searchQuery, setSearchQuery,
  } = useAssignments();

  useEffect(() => { loadAssignments(); }, []);

  const handleDelete = useCallback((id: string) => {
    Alert.alert(
      'Delete Assignment',
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteAssignment(id) },
      ]
    );
  }, [deleteAssignment]);

  // Shake to mark first visible assignment complete
  useShakeDetection(() => {
    const first = filteredAssignments.find((a) => a.status === 'Pending');
    if (first) {
      Alert.alert('Shake Detected!', `Complete "${first.title}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => markComplete(first.id) },
      ]);
    }
  });

  if (isLoading && filteredAssignments.length === 0) {
    return <LoadingSpinner fullScreen message="Loading assignments..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchInput}>
          <Input
            placeholder="Search assignments..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon="search-outline"
          />
        </View>
        <TouchableOpacity
          onPress={() => router.push('/assignment/add')}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Priority Filter Chips */}
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setPriorityFilter(f)}
            style={[
              styles.chip,
              { borderColor: colors.border },
              priorityFilter === f && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
          >
            <Text style={[styles.chipText, { color: priorityFilter === f ? '#fff' : colors.textSecondary }]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredAssignments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AssignmentCard
            assignment={item}
            onMarkComplete={markComplete}
            onMarkIncomplete={markIncomplete}
            onDelete={handleDelete}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="document-outline"
            title="No assignments found"
            message={searchQuery ? 'Try a different search term.' : 'Create your first assignment.'}
            actionLabel="Add Assignment"
            onAction={() => router.push('/assignment/add')}
          />
        }
        refreshing={isLoading}
        onRefresh={loadAssignments}
      />

      <Text style={[styles.shakeHint, { color: colors.textDisabled }]}>
        Shake to complete first pending assignment
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: Spacing.sm },
  searchInput: { flex: 1 },
  addBtn: { width: 48, height: 48, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  filters: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.sm },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, borderWidth: 1 },
  chipText: { fontSize: FontSize.sm, fontWeight: '600' },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  shakeHint: { fontSize: FontSize.xs, textAlign: 'center', paddingBottom: Spacing.sm },
});
