import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Image,
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAssignments } from '../../hooks/useAssignments';
import { speakText, stopSpeaking } from '../../services/ai/speechService';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatDateTime, getDueDateLabel, isOverdue } from '../../utils/dateUtils';
import { Spacing, FontSize } from '../../constants/theme';
import type { Assignment } from '../../types';

export default function AssignmentDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { assignments, markComplete, markIncomplete, deleteAssignment } = useAssignments();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const assignment = assignments.find((a) => a.id === id) ?? null;

  // Set header edit button
  useEffect(() => {
    if (assignment) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={() => router.push(`/assignment/edit/${id}`)}>
            <Ionicons name="pencil-outline" size={22} color={colors.primary} style={{ marginRight: 8 }} />
          </TouchableOpacity>
        ),
      });
    }
  }, [assignment]);

  async function toggleSpeech() {
    if (isSpeaking) {
      await stopSpeaking();
      setIsSpeaking(false);
    } else {
      if (!assignment) return;
      const text = `Assignment: ${assignment.title}. Subject: ${assignment.subject}. ${
        assignment.description ? `Description: ${assignment.description}.` : ''
      } Due: ${getDueDateLabel(assignment.dueDate)}. Priority: ${assignment.priority}. ${
        assignment.notes ? `Notes: ${assignment.notes}.` : ''
      }`;
      setIsSpeaking(true);
      await speakText(text, { onDone: () => setIsSpeaking(false), onError: () => setIsSpeaking(false) });
    }
  }

  function handleDelete() {
    Alert.alert('Delete Assignment', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await deleteAssignment(id);
          setTimeout(() => {
            if (router.canGoBack()) router.back();
            else router.replace('/(tabs)/assignments');
          }, 0);
        },
      },
    ]);
  }

  if (!assignment) return <LoadingSpinner fullScreen />;

  const overdue = isOverdue(assignment.dueDate) && assignment.status === 'Pending';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Priority Header */}
      <View style={[styles.header, { backgroundColor: priorityColor(assignment.priority, colors) + '22' }]}>
        <View style={styles.headerBadges}>
          <Badge label={assignment.priority} variant={assignment.priority} />
          <Badge label={assignment.status} variant={assignment.status} />
          {overdue && <Badge label="OVERDUE" variant="High" />}
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{assignment.title}</Text>
        <Text style={[styles.subject, { color: colors.textSecondary }]}>{assignment.subject}</Text>
      </View>

      <View style={styles.content}>
        {/* TTS Button */}
        <TouchableOpacity
          style={[styles.ttsBtn, { backgroundColor: isSpeaking ? colors.error : colors.primary }]}
          onPress={toggleSpeech}
        >
          <Ionicons name={isSpeaking ? 'stop-circle-outline' : 'volume-high-outline'} size={20} color="#fff" />
          <Text style={styles.ttsBtnText}>
            {isSpeaking ? 'Stop Reading' : 'Read Aloud (AI TTS)'}
          </Text>
        </TouchableOpacity>

        {/* Due Date */}
        <Card>
          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={20} color={overdue ? colors.error : colors.primary} />
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Due Date</Text>
              <Text style={[styles.rowValue, { color: overdue ? colors.error : colors.text }]}>
                {formatDateTime(assignment.dueDate)}
              </Text>
              <Text style={[styles.rowSub, { color: overdue ? colors.error : colors.textSecondary }]}>
                {getDueDateLabel(assignment.dueDate)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Description */}
        {assignment.description ? (
          <Card>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Description</Text>
            <Text style={[styles.bodyText, { color: colors.text }]}>{assignment.description}</Text>
          </Card>
        ) : null}

        {/* Notes */}
        {assignment.notes ? (
          <Card>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Notes</Text>
            <Text style={[styles.bodyText, { color: colors.text }]}>{assignment.notes}</Text>
          </Card>
        ) : null}

        {/* Photo */}
        {assignment.imageUri ? (
          <Card padding={false}>
            <Image source={{ uri: assignment.imageUri }} style={styles.image} />
          </Card>
        ) : null}

        {/* Meta */}
        <Card>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Details</Text>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            Created: {formatDateTime(assignment.createdAt)}
          </Text>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            Updated: {formatDateTime(assignment.updatedAt)}
          </Text>
        </Card>

        {/* Actions */}
        {assignment.status === 'Pending' ? (
          <Button
            label="Mark as Complete"
            onPress={() => markComplete(id)}
            fullWidth
            size="lg"
            style={styles.actionBtn}
          />
        ) : (
          <Button
            label="Mark as Incomplete"
            onPress={() => markIncomplete(id)}
            variant="outline"
            fullWidth
            size="lg"
            style={styles.actionBtn}
          />
        )}
        <Button
          label="Edit Assignment"
          onPress={() => router.push(`/assignment/edit/${id}`)}
          variant="outline"
          fullWidth
          style={styles.actionBtn}
        />
        <Button
          label="Delete Assignment"
          onPress={handleDelete}
          variant="danger"
          fullWidth
          style={styles.actionBtn}
        />
      </View>
    </ScrollView>
  );
}

function priorityColor(priority: string, colors: any): string {
  switch (priority) {
    case 'High':   return colors.priorityHigh;
    case 'Medium': return colors.priorityMedium;
    case 'Low':    return colors.priorityLow;
    default:       return colors.border;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: Spacing.xl },
  headerBadges: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: '700', marginBottom: Spacing.xs },
  subject: { fontSize: FontSize.md },
  content: { padding: Spacing.md, gap: Spacing.md },
  ttsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: 12 },
  ttsBtnText: { color: '#fff', fontWeight: '600', fontSize: FontSize.md },
  row: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  rowText: {},
  rowLabel: { fontSize: FontSize.xs },
  rowValue: { fontSize: FontSize.md, fontWeight: '600' },
  rowSub: { fontSize: FontSize.xs },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '600', marginBottom: Spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  bodyText: { fontSize: FontSize.md, lineHeight: 22 },
  metaText: { fontSize: FontSize.xs, marginTop: 2 },
  image: { width: '100%', height: 200, borderRadius: 12 },
  actionBtn: { marginBottom: Spacing.xs },
});
