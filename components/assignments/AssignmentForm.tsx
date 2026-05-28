import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
// Web date input rendered via DOM — datetimepicker is native-only
const WebDateInput =
  Platform.OS === 'web'
    ? ({ value, onChange, style }: { value: string; onChange: (v: string) => void; style?: any }) =>
        React.createElement('input', {
          type: 'date',
          value,
          onChange: (e: any) => onChange(e.target.value),
          style: {
            border: 'none', outline: 'none', background: 'transparent',
            fontSize: 15, width: '100%', cursor: 'pointer', ...style,
          },
        })
    : null;
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { AssignmentFormData, Priority } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useTheme } from '../../hooks/useTheme';
import { validateAssignmentForm } from '../../utils/validators';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';

interface AssignmentFormProps {
  initialValues?: Partial<AssignmentFormData>;
  onSubmit: (data: AssignmentFormData) => Promise<void>;
  submitLabel?: string;
}

const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];

export function AssignmentForm({ initialValues, onSubmit, submitLabel = 'Save Assignment' }: AssignmentFormProps) {
  const { colors } = useTheme();
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [subject, setSubject] = useState(initialValues?.subject ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [dueDate, setDueDate] = useState<Date>(
    initialValues?.dueDate ? new Date(initialValues.dueDate) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState<Priority>(initialValues?.priority ?? 'Medium');
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [imageUri, setImageUri] = useState(initialValues?.imageUri ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    const validation = validateAssignmentForm({ title, subject, dueDate: dueDate.toISOString() });
    if (Object.keys(validation).length > 0) {
      setErrors(validation as Record<string, string>);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim(),
        dueDate: dueDate.toISOString(),
        priority,
        status: initialValues?.status ?? 'Pending',
        notes: notes.trim(),
        imageUri: imageUri || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Input
        label="Title *"
        placeholder="e.g. Research Paper on Climate Change"
        value={title}
        onChangeText={setTitle}
        error={errors.title}
        leftIcon="document-text-outline"
      />

      <Input
        label="Subject *"
        placeholder="e.g. Environmental Science"
        value={subject}
        onChangeText={setSubject}
        error={errors.subject}
        leftIcon="school-outline"
      />

      <Input
        label="Description"
        placeholder="Brief description of the assignment..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        leftIcon="reorder-three-outline"
      />

      {/* Due Date Picker */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Due Date *</Text>

        {Platform.OS === 'web' && WebDateInput ? (
          <View style={[styles.datePicker, { borderColor: errors.dueDate ? colors.error : colors.border, backgroundColor: colors.surface }]}>
            <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
            <WebDateInput
              value={dueDate.toISOString().split('T')[0]}
              onChange={(v) => { if (v) setDueDate(new Date(v)); }}
            />
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={[styles.datePicker, { borderColor: errors.dueDate ? colors.error : colors.border, backgroundColor: colors.surface }]}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.dateText, { color: colors.text }]}>
              {dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
          </TouchableOpacity>
        )}
        {errors.dueDate && <Text style={[styles.error, { color: colors.error }]}>{errors.dueDate}</Text>}
      </View>

      {showDatePicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          minimumDate={new Date()}
          onChange={(_, date) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (date) setDueDate(date);
          }}
        />
      )}

      {/* Priority Selector */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Priority</Text>
        <View style={styles.priorityRow}>
          {PRIORITIES.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPriority(p)}
              style={[
                styles.priorityBtn,
                { borderColor: priorityColor(p, colors) },
                priority === p && { backgroundColor: priorityColor(p, colors) },
              ]}
            >
              <Text style={{ color: priority === p ? '#fff' : priorityColor(p, colors), fontWeight: '600', fontSize: FontSize.sm }}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Input
        label="Notes"
        placeholder="Any additional notes..."
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        leftIcon="create-outline"
      />

      {/* Photo Attachment */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Photo Attachment</Text>
        <TouchableOpacity
          onPress={pickImage}
          style={[styles.imagePicker, { borderColor: colors.border, backgroundColor: colors.surfaceVariant }]}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={28} color={colors.textDisabled} />
              <Text style={[styles.imagePlaceholderText, { color: colors.textDisabled }]}>
                Tap to attach photo
              </Text>
            </View>
          )}
        </TouchableOpacity>
        {imageUri && (
          <TouchableOpacity onPress={() => setImageUri('')}>
            <Text style={[styles.removePhoto, { color: colors.error }]}>Remove photo</Text>
          </TouchableOpacity>
        )}
      </View>

      <Button
        label={submitLabel}
        onPress={handleSubmit}
        loading={submitting}
        fullWidth
        style={styles.submitBtn}
      />
    </ScrollView>
  );
}

function priorityColor(priority: Priority, colors: any): string {
  switch (priority) {
    case 'High':   return colors.priorityHigh;
    case 'Medium': return colors.priorityMedium;
    case 'Low':    return colors.priorityLow;
  }
}

const styles = StyleSheet.create({
  fieldGroup: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: '500', marginBottom: Spacing.xs },
  datePicker: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderWidth: 1.5, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, height: 50,
  },
  dateText: { fontSize: FontSize.md },
  error: { fontSize: FontSize.xs, marginTop: Spacing.xs },
  priorityRow: { flexDirection: 'row', gap: Spacing.sm },
  priorityBtn: {
    flex: 1, height: 40, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderRadius: BorderRadius.md,
  },
  imagePicker: { height: 120, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: BorderRadius.md, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.xs },
  imagePlaceholderText: { fontSize: FontSize.sm },
  removePhoto: { fontSize: FontSize.sm, marginTop: Spacing.xs },
  submitBtn: { marginTop: Spacing.lg, marginBottom: Spacing.xxl },
});
