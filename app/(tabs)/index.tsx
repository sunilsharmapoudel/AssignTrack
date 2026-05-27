import React, { useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAssignments } from '../../hooks/useAssignments';
import { useAuthStore } from '../../store/authStore';
import { useShakeDetection } from '../../hooks/useSensors';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { ProgressBar } from '../../components/dashboard/ProgressBar';
import { AssignmentCard } from '../../components/assignments/AssignmentCard';
import { BannerAd } from '../../components/ads/BannerAd';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spacing, FontSize } from '../../constants/theme';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { profile } = useAuthStore();
  const {
    upcomingAssignments, overdueAssignments, dashboardStats,
    isLoading, loadAssignments, markComplete, markIncomplete, deleteAssignment,
  } = useAssignments();

  useEffect(() => {
    loadAssignments();
  }, []);

  // Shake phone to complete the first pending assignment
  useShakeDetection(() => {
    if (upcomingAssignments.length > 0) {
      Alert.alert(
        'Shake Detected!',
        `Mark "${upcomingAssignments[0].title}" as complete?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Complete', onPress: () => markComplete(upcomingAssignments[0].id) },
        ]
      );
    }
  });

  const handleDelete = useCallback((id: string) => {
    Alert.alert(
      'Delete Assignment',
      'Are you sure you want to delete this assignment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteAssignment(id) },
      ]
    );
  }, [deleteAssignment]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadAssignments} />}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.userName}>{profile?.displayName ?? 'Student'} 👋</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push('/notes')} style={styles.headerBtn}>
            <Ionicons name="mic-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/focus')} style={styles.headerBtn}>
            <Ionicons name="flashlight-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.headerBtn}>
            <Ionicons name="settings-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* AdMob Banner */}
        <BannerAd />

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <StatsCard icon="document-outline" label="Total" value={dashboardStats.total} />
          <StatsCard icon="checkmark-circle-outline" label="Done" value={dashboardStats.completed} color={colors.success} />
          <StatsCard icon="warning-outline" label="Overdue" value={dashboardStats.overdue} color={colors.error} />
        </View>

        {/* Progress */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Completion Progress</Text>
          <ProgressBar percentage={dashboardStats.completionPercentage} label="Overall" />
          <Text style={[styles.progressHint, { color: colors.textSecondary }]}>
            {dashboardStats.completed} of {dashboardStats.total} assignments completed
          </Text>
        </View>

        {/* Overdue Alerts */}
        {overdueAssignments.length > 0 && (
          <View style={[styles.overdueSection, { backgroundColor: colors.error + '11', borderColor: colors.error + '44' }]}>
            <View style={styles.overdueHeader}>
              <Ionicons name="warning" size={18} color={colors.error} />
              <Text style={[styles.overdueTitle, { color: colors.error }]}>
                {overdueAssignments.length} Overdue Assignment{overdueAssignments.length > 1 ? 's' : ''}
              </Text>
            </View>
            {overdueAssignments.slice(0, 2).map((a) => (
              <AssignmentCard key={a.id} assignment={a} onMarkComplete={markComplete} onMarkIncomplete={markIncomplete} compact />
            ))}
          </View>
        )}

        {/* Upcoming */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/assignments')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>

          {upcomingAssignments.length === 0 ? (
            <EmptyState
              icon="checkmark-done-outline"
              title="All caught up!"
              message="No upcoming assignments. Great work!"
            />
          ) : (
            upcomingAssignments.map((a) => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                onMarkComplete={markComplete}
                onMarkIncomplete={markIncomplete}
                onDelete={handleDelete}
              />
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/assignment/add')}
          >
            <Ionicons name="add" size={22} color="#fff" />
            <Text style={styles.quickBtnText}>New Assignment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: colors.secondary }]}
            onPress={() => router.push('/notification-settings')}
          >
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            <Text style={styles.quickBtnText}>Reminders</Text>
          </TouchableOpacity>
        </View>

        {/* Sensor hints */}
        <Text style={[styles.hint, { color: colors.textDisabled }]}>
          💡 Shake your phone to complete the first assignment · Tilt to filter by priority
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.xl, paddingTop: Spacing.xxl,
  },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm },
  userName: { color: '#fff', fontSize: FontSize.xl, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  headerBtn: { padding: Spacing.xs },
  content: { padding: Spacing.md },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  section: { marginBottom: Spacing.md, borderRadius: 12, padding: Spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700' },
  seeAll: { fontSize: FontSize.sm, fontWeight: '600' },
  progressHint: { fontSize: FontSize.xs, marginTop: Spacing.sm },
  overdueSection: { borderWidth: 1, borderRadius: 12, padding: Spacing.md, marginBottom: Spacing.md },
  overdueHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.sm },
  overdueTitle: { fontSize: FontSize.md, fontWeight: '700' },
  quickActions: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  quickBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.xs, padding: Spacing.md, borderRadius: 12,
  },
  quickBtnText: { color: '#fff', fontWeight: '600', fontSize: FontSize.sm },
  hint: { fontSize: FontSize.xs, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 18 },
});
