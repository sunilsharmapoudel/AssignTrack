import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useAssignments } from '../../hooks/useAssignments';
import { AssignmentForm } from '../../components/assignments/AssignmentForm';
import { Spacing } from '../../constants/theme';
import type { AssignmentFormData } from '../../types';

export default function AddAssignmentScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { createAssignment } = useAssignments();

  async function handleSubmit(data: AssignmentFormData) {
    await createAssignment(data);
    router.back();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AssignmentForm onSubmit={handleSubmit} submitLabel="Create Assignment" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.md },
});
