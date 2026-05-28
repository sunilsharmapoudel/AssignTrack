import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useAssignments } from '../../hooks/useAssignments';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/dashboard/ProgressBar';
import { APP_VERSION } from '../../constants/config';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user, profile, signOut, updateProfile, isLoading } = useAuth();
  const { dashboardStats } = useAssignments();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.displayName ?? '');
  const [university, setUniversity] = useState(profile?.university ?? '');
  const [course, setCourse] = useState(profile?.course ?? '');

  async function handleSave() {
    await updateProfile({ displayName: name.trim(), university: university.trim(), course: course.trim() });
    setEditing(false);
  }

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Avatar Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile?.displayName ?? user?.email ?? 'U')[0].toUpperCase()}
          </Text>
        </View>
        {editing ? (
          <View style={styles.editNameRow}>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              style={{ color: '#fff' }}
            />
          </View>
        ) : (
          <>
            <Text style={styles.displayName}>{profile?.displayName ?? 'Student'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </>
        )}
      </View>

      <View style={styles.content}>
        {/* Academic Stats */}
        <Card style={styles.statsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Academic Progress</Text>
          <ProgressBar
            percentage={dashboardStats.completionPercentage}
            label="Completion Rate"
          />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{dashboardStats.total}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.success }]}>{dashboardStats.completed}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.error }]}>{dashboardStats.overdue}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Overdue</Text>
            </View>
          </View>
        </Card>

        {/* Profile Details */}
        <Card>
          <View style={styles.cardHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile Details</Text>
            <TouchableOpacity onPress={() => setEditing((v) => !v)}>
              <Ionicons name={editing ? 'close-outline' : 'pencil-outline'} size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {editing ? (
            <>
              <Input label="University" value={university} onChangeText={setUniversity} placeholder="e.g. MIT" leftIcon="school-outline" />
              <Input label="Course / Degree" value={course} onChangeText={setCourse} placeholder="e.g. Computer Science" leftIcon="book-outline" />
              <Button label="Save Changes" onPress={handleSave} loading={isLoading} fullWidth />
            </>
          ) : (
            <>
              <ProfileRow icon="mail-outline" label="Email" value={user?.email ?? ''} colors={colors} />
              <ProfileRow icon="school-outline" label="University" value={profile?.university ?? 'Not set'} colors={colors} />
              <ProfileRow icon="book-outline" label="Course" value={profile?.course ?? 'Not set'} colors={colors} />
            </>
          )}
        </Card>

        {/* Menu Items */}
        <Card>
          <MenuItem icon="notifications-outline" label="Notification Settings" onPress={() => router.push('/notification-settings')} colors={colors} />
          <MenuItem icon="settings-outline" label="App Settings" onPress={() => router.push('/settings')} colors={colors} />
          <MenuItem icon="battery-half-outline" label="Battery Status" onPress={() => router.push('/battery')} colors={colors} />
          <MenuItem icon="mic-outline" label="Voice Notes" onPress={() => router.push('/notes')} colors={colors} />
          <MenuItem icon="flashlight-outline" label="Focus Mode" onPress={() => router.push('/focus')} colors={colors} />
        </Card>

        {/* Sign Out */}
        <Button
          label="Sign Out"
          onPress={handleSignOut}
          variant="danger"
          fullWidth
          style={styles.signOutBtn}
        />

        <Text style={[styles.version, { color: colors.textDisabled }]}>
          AssignTrack v{APP_VERSION}
        </Text>
      </View>
    </ScrollView>
  );
}

function ProfileRow({ icon, label, value, colors }: any) {
  return (
    <View style={styles.profileRow}>
      <Ionicons name={icon} size={18} color={colors.textSecondary} />
      <View style={styles.profileRowText}>
        <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.profileValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

function MenuItem({ icon, label, onPress, colors }: any) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', padding: Spacing.xl, paddingTop: Spacing.xxl },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  avatarText: { color: '#fff', fontSize: FontSize.xxxl, fontWeight: '700' },
  editNameRow: { width: '100%' },
  displayName: { color: '#fff', fontSize: FontSize.xl, fontWeight: '700' },
  email: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm, marginTop: 4 },
  content: { padding: Spacing.md, gap: Spacing.md },
  statsCard: {},
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: Spacing.md },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: FontSize.xxl, fontWeight: '700' },
  statLabel: { fontSize: FontSize.xs, marginTop: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  profileRowText: {},
  profileLabel: { fontSize: FontSize.xs },
  profileValue: { fontSize: FontSize.md, fontWeight: '500' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  menuLabel: { flex: 1, fontSize: FontSize.md },
  signOutBtn: { marginTop: Spacing.sm },
  version: { textAlign: 'center', fontSize: FontSize.xs, marginBottom: Spacing.xxl },
});
