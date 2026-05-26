import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../hooks/useTheme';
import { useAssignments } from '../../../hooks/useAssignments';
import { AssignmentForm } from '../../../components/assignments/AssignmentForm';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Spacing } from '../../../constants/theme';
import type { AssignmentFormData } from '../../../types';

export default function EditAssignmentScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { assignments, updateAssignment } = useAssignments();

  const assignment = assignments.find((a) => a.id === id);

  if (!assignment) return <LoadingSpinner fullScreen />;

  async function handleSubmit(data: AssignmentFormData) {
    await updateAssignment(id, data);
    // Defer navigation past the current render cycle — calling router.back()
    // synchronously after an await that triggers onSnapshot can fire before
    // the navigation stack has settled.
    setTimeout(() => {
      if (router.canGoBack()) router.back();
      else router.replace('/(tabs)/assignments');
    }, 0);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AssignmentForm
        initialValues={assignment}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.md },
});
