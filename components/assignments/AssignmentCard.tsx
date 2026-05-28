import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Assignment } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useTheme } from '../../hooks/useTheme';
import { getDueDateLabel, isOverdue, isDueToday } from '../../utils/dateUtils';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';

interface AssignmentCardProps {
  assignment: Assignment;
  onMarkComplete?: (id: string) => void;
  onMarkIncomplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

export function AssignmentCard({ assignment, onMarkComplete, onMarkIncomplete, onDelete, compact = false }: AssignmentCardProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const overdue = isOverdue(assignment.dueDate) && assignment.status === 'Pending';
  const dueToday = isDueToday(assignment.dueDate);
  const dueLabelColor = overdue ? colors.error : dueToday ? colors.warning : colors.textSecondary;
  const isComplete = assignment.status === 'Completed';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/assignment/${assignment.id}`)}
    >
      <Card style={[styles.card, isComplete && styles.completedCard]}>
        {/* Priority stripe */}
        <View style={[styles.stripe, { backgroundColor: priorityColor(assignment.priority, colors) }]} />

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text
                style={[styles.title, { color: colors.text }, isComplete && styles.strikethrough]}
                numberOfLines={compact ? 1 : 2}
              >
                {assignment.title}
              </Text>
              {isComplete && (
                <Ionicons name="checkmark-circle" size={18} color={colors.success} style={styles.checkIcon} />
              )}
            </View>
            <View style={styles.badges}>
              <Badge label={assignment.priority} variant={assignment.priority} />
              {!compact && <Badge label={assignment.status} variant={assignment.status} />}
            </View>
          </View>

          <Text style={[styles.subject, { color: colors.textSecondary }]}>{assignment.subject}</Text>

          <View style={styles.footer}>
            <View style={styles.dueDateRow}>
              <Ionicons
                name={overdue ? 'warning-outline' : 'calendar-outline'}
                size={13}
                color={dueLabelColor}
              />
              <Text style={[styles.dueDate, { color: dueLabelColor }]}>
                {getDueDateLabel(assignment.dueDate)}
              </Text>
            </View>

            <View style={styles.actions}>
              {isComplete && onMarkIncomplete && (
                <TouchableOpacity
                  onPress={() => onMarkIncomplete(assignment.id)}
                  style={[styles.actionBtn, { backgroundColor: colors.warning + '22' }]}
                >
                  <Ionicons name="arrow-undo-outline" size={16} color={colors.warning} />
                </TouchableOpacity>
              )}
              {!isComplete && onMarkComplete && (
                <TouchableOpacity
                  onPress={() => onMarkComplete(assignment.id)}
                  style={[styles.actionBtn, { backgroundColor: colors.success + '22' }]}
                >
                  <Ionicons name="checkmark" size={16} color={colors.success} />
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity
                  onPress={() => onDelete(assignment.id)}
                  style={[styles.actionBtn, { backgroundColor: colors.error + '22' }]}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
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
  card: { flexDirection: 'row', marginBottom: Spacing.sm, padding: 0, overflow: 'hidden' },
  completedCard: { opacity: 0.7 },
  stripe: { width: 4, borderTopLeftRadius: BorderRadius.lg, borderBottomLeftRadius: BorderRadius.lg },
  content: { flex: 1, padding: Spacing.md },
  header: { marginBottom: Spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.xs },
  title: { flex: 1, fontSize: FontSize.md, fontWeight: '600', lineHeight: 20 },
  checkIcon: { marginLeft: Spacing.xs, marginTop: 2 },
  strikethrough: { textDecorationLine: 'line-through', opacity: 0.7 },
  badges: { flexDirection: 'row', gap: Spacing.xs },
  subject: { fontSize: FontSize.sm, marginBottom: Spacing.sm },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dueDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dueDate: { fontSize: FontSize.xs, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: Spacing.xs },
  actionBtn: { padding: Spacing.xs, borderRadius: BorderRadius.sm },
});
