import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import { useAudioRecorder, useAudioPlayer, RecordingPresets } from 'expo-audio';
import {
  speakText, stopSpeaking, isSpeaking,
  requestMicrophonePermission,
} from '../services/ai/speechService';
import {
  createNote, getNotesByUser, updateNote, deleteNote,
} from '../services/firebase/firestore';
import { localUpsertNote, localGetNotes, localDeleteNote } from '../services/sqlite/assignmentQueries';
import { isOnline } from '../services/network/connectivityService';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import type { Note } from '../types';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';
import { formatRelative } from '../utils/dateUtils';

export default function NotesScreen() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pendingAudioUri, setPendingAudioUri] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [activeAudioUri, setActiveAudioUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const player = useAudioPlayer(activeAudioUri ? { uri: activeAudioUri } : null);

  useEffect(() => {
    loadNotes();
  }, []);

  // Trigger playback after useAudioPlayer has loaded the new source.
  // useEffect runs after render, so `player` here is the new instance
  // for the updated activeAudioUri — not the old released one.
  useEffect(() => {
    if (activeAudioUri) {
      player.play();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAudioUri]);

  async function loadNotes() {
    if (!user) return;
    const [local, online] = await Promise.all([
      localGetNotes(user.uid),
      isOnline(),
    ]);
    setNotes(local);
    if (online) {
      const cloud = await getNotesByUser(user.uid).catch(() => []);
      await Promise.all(cloud.map((n) => localUpsertNote(n)));
      setNotes(cloud);
    }
  }

  async function handleStartRecording() {
    const granted = await requestMicrophonePermission();
    if (!granted) {
      Alert.alert('Permission Required', 'Microphone access is needed for voice notes.');
      return;
    }
    setPendingAudioUri(null);
    await recorder.prepareToRecordAsync();
    recorder.record();
    setRecording(true);
  }

  async function handleStopRecording() {
    await recorder.stop();
    setRecording(false);
    if (recorder.uri) {
      setPendingAudioUri(recorder.uri);
    }
  }

  async function handlePlayAudio(note: Note) {
    if (!note.audioUri) return;

    if (playingId === note.id) {
      player.pause();
      setPlayingId(null);
      setActiveAudioUri(null);
      return;
    }

    setActiveAudioUri(note.audioUri);
    setPlayingId(note.id);
    // player.play() is called in the useEffect above after the new source loads
  }

  // Web Speech API (browser only)
  function handleWebSpeechRecognition() {
    if (Platform.OS !== 'web') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      Alert.alert('Not Supported', 'Web speech recognition is not available in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript: string = event.results[0][0].transcript;
      setContent((prev) => prev + (prev ? ' ' : '') + transcript);
    };
    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);
    setRecording(true);
    recognition.start();
  }

  async function handleTTS(note: Note) {
    const currentlySpeaking = await isSpeaking();
    if (currentlySpeaking && speakingId === note.id) {
      await stopSpeaking();
      setSpeaking(false);
      setSpeakingId(null);
      return;
    }
    setSpeakingId(note.id);
    setSpeaking(true);
    await speakText(`${note.title}. ${note.content}`, {
      onDone: () => { setSpeaking(false); setSpeakingId(null); },
      onError: () => { setSpeaking(false); setSpeakingId(null); },
    });
  }

  async function handleSave() {
    if (!user || !title.trim()) return;
    setLoading(true);
    const now = new Date().toISOString();
    try {
      if (editingNote) {
        const updated: Note = {
          ...editingNote,
          title: title.trim(),
          content,
          // Keep existing audioUri unless a new recording was made
          audioUri: pendingAudioUri ?? editingNote.audioUri,
          updatedAt: now,
        };
        const online = await isOnline();
        if (online) await updateNote(editingNote.id, { title: updated.title, content: updated.content, audioUri: updated.audioUri });
        await localUpsertNote(updated);
        setNotes((prev) => prev.map((n) => (n.id === editingNote.id ? updated : n)));
      } else {
        const noteData = {
          title: title.trim(),
          content,
          audioUri: pendingAudioUri ?? undefined,
          userId: user.uid,
        };
        const online = await isOnline();
        let id: string;
        if (online) {
          id = await createNote(noteData);
        } else {
          id = `local_${Date.now()}`;
        }
        const note: Note = { id, ...noteData, createdAt: now, updatedAt: now };
        await localUpsertNote(note);
        setNotes((prev) => [note, ...prev]);
      }
      setTitle('');
      setContent('');
      setPendingAudioUri(null);
      setEditingNote(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    Alert.alert('Delete Note', 'Remove this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const online = await isOnline();
          if (online) await deleteNote(id).catch(() => {});
          await localDeleteNote(id);
          setNotes((prev) => prev.filter((n) => n.id !== id));
        },
      },
    ]);
  }

  function handleEdit(note: Note) {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setPendingAudioUri(null); // start fresh — tap Dictate to record a new one
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Composer */}
      <Card style={styles.composer}>
        <Text style={[styles.composerTitle, { color: colors.text }]}>
          {editingNote ? 'Edit Note' : 'New Voice Note (AI STT/TTS)'}
        </Text>

        <Input
          label="Title"
          placeholder="Note title..."
          value={title}
          onChangeText={setTitle}
          leftIcon="document-text-outline"
        />

        <Input
          label="Content"
          placeholder="Type or use the microphone to dictate..."
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={4}
          leftIcon="create-outline"
        />

        {/* Voice Controls */}
        <View style={styles.voiceRow}>
          <TouchableOpacity
            onPress={
              Platform.OS === 'web'
                ? handleWebSpeechRecognition
                : recording ? handleStopRecording : handleStartRecording
            }
            style={[
              styles.micBtn,
              { backgroundColor: recording ? colors.error : colors.primary },
            ]}
          >
            <Ionicons name={recording ? 'stop-circle' : 'mic'} size={24} color="#fff" />
            <Text style={styles.micBtnText}>{recording ? 'Stop' : 'Record'}</Text>
          </TouchableOpacity>

          {pendingAudioUri ? (
            <View style={[styles.recordingReady, { backgroundColor: colors.success + '22' }]}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={[styles.recordingReadyText, { color: colors.success }]}>
                Recording ready · will save with note
              </Text>
            </View>
          ) : (
            <Text style={[styles.aiLabel, { color: colors.textDisabled }]}>
              {Platform.OS === 'web' ? 'Web Speech API' : 'Tap Record, then Save'}
            </Text>
          )}
        </View>

        <Button
          label={editingNote ? 'Update Note' : 'Save Note'}
          onPress={handleSave}
          loading={loading}
          disabled={!title.trim()}
          fullWidth
        />
        {editingNote && (
          <Button
            label="Cancel Edit"
            onPress={() => { setEditingNote(null); setTitle(''); setContent(''); }}
            variant="ghost"
            fullWidth
          />
        )}
      </Card>

      {/* Notes List */}
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="mic-outline"
            title="No notes yet"
            message="Dictate your first voice note using the microphone above."
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <Text style={[styles.noteTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.noteActions}>
                {/* Play recorded audio (if any) */}
                {item.audioUri ? (
                  <TouchableOpacity onPress={() => handlePlayAudio(item)} style={styles.noteActionBtn}>
                    <Ionicons
                      name={playingId === item.id ? 'stop-circle-outline' : 'play-circle-outline'}
                      size={20}
                      color={playingId === item.id ? colors.error : colors.success}
                    />
                  </TouchableOpacity>
                ) : null}
                {/* TTS — read text aloud */}
                <TouchableOpacity onPress={() => handleTTS(item)} style={styles.noteActionBtn}>
                  <Ionicons
                    name={speaking && speakingId === item.id ? 'stop-circle-outline' : 'volume-high-outline'}
                    size={18}
                    color={speaking && speakingId === item.id ? colors.error : colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleEdit(item)} style={styles.noteActionBtn}>
                  <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.noteActionBtn}>
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
            {item.content ? (
              <Text style={[styles.noteContent, { color: colors.textSecondary }]} numberOfLines={3}>
                {item.content}
              </Text>
            ) : null}
            <View style={styles.noteMeta}>
              {item.audioUri ? (
                <View style={styles.audioChip}>
                  <Ionicons name="mic" size={11} color={colors.success} />
                  <Text style={[styles.audioChipText, { color: colors.success }]}>recording</Text>
                </View>
              ) : null}
              <Text style={[styles.noteDate, { color: colors.textDisabled }]}>
                {formatRelative(item.updatedAt)}
              </Text>
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  composer: { margin: Spacing.md },
  composerTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
  voiceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  micBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
  micBtnText: { color: '#fff', fontWeight: '600', fontSize: FontSize.sm },
  aiLabel: { flex: 1, fontSize: FontSize.xs },
  recordingReady: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: 8 },
  recordingReadyText: { fontSize: FontSize.xs, fontWeight: '500' },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  noteCard: { marginBottom: Spacing.sm },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  noteTitle: { flex: 1, fontSize: FontSize.md, fontWeight: '700' },
  noteActions: { flexDirection: 'row', gap: Spacing.xs },
  noteActionBtn: { padding: Spacing.xs },
  noteContent: { fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.xs },
  noteMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 2 },
  noteDate: { fontSize: FontSize.xs },
  audioChip: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  audioChipText: { fontSize: 10, fontWeight: '600' },
});
