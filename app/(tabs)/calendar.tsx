import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useTheme } from '../../hooks/useTheme';
import { useAssignments } from '../../hooks/useAssignments';
import { AssignmentCard } from '../../components/assignments/AssignmentCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { calendarDateString, formatDate } from '../../utils/dateUtils';
import { Spacing, FontSize } from '../../constants/theme';
import type { Assignment } from '../../types';

export default function CalendarScreen() {
  const { colors, isDark } = useTheme();
  const { assignments, loadAssignments, markComplete, markIncomplete } = useAssignments();
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => { loadAssignments(); }, []);

  // Build calendar marked dates from assignments
  const markedDates = assignments.reduce<Record<string, any>>((acc, a) => {
    const key = calendarDateString(a.dueDate);
    const dotColor =
      a.priority === 'High' ? colors.priorityHigh :
      a.priority === 'Medium' ? colors.priorityMedium :
      colors.priorityLow;

    acc[key] = {
      ...acc[key],
      dots: [...(acc[key]?.dots ?? []), { key: a.id, color: dotColor }],
      marked: true,
    };
    return acc;
  }, {});

  // Also mark selected date
  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: colors.primary,
    };
  }

  const assignmentsOnDate: Assignment[] = selectedDate
    ? assignments.filter((a) => calendarDateString(a.dueDate) === selectedDate)
    : [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Calendar
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        theme={{
          backgroundColor: colors.background,
          calendarBackground: colors.surface,
          textSectionTitleColor: colors.textSecondary,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: '#fff',
          todayTextColor: colors.primary,
          dayTextColor: colors.text,
          textDisabledColor: colors.textDisabled,
          dotColor: colors.primary,
          monthTextColor: colors.text,
          indicatorColor: colors.primary,
          arrowColor: colors.primary,
        }}
      />

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {selectedDate ? (
          <>
            <Text style={[styles.dateHeading, { color: colors.text }]}>
              Assignments for {formatDate(selectedDate)}
            </Text>
            {assignmentsOnDate.length === 0 ? (
              <EmptyState
                icon="calendar-outline"
                title="No assignments"
                message="Nothing due on this date."
              />
            ) : (
              assignmentsOnDate.map((a) => (
                <AssignmentCard key={a.id} assignment={a} onMarkComplete={markComplete} onMarkIncomplete={markIncomplete} />
              ))
            )}
          </>
        ) : (
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Tap a date to see assignments due on that day.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1 },
  listContent: { padding: Spacing.md },
  dateHeading: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
  hint: { textAlign: 'center', marginTop: Spacing.xl, fontSize: FontSize.md },
});
