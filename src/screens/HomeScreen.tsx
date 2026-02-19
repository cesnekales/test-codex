import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DAILY_GOAL, TASKS, Task } from '../constants/tasks';
import { TaskList } from '../components/TaskList';
import { AppData, appDataStorage } from '../storage/appData';

type HomeScreenProps = {
  appData: AppData;
  onComplete: (task: Task) => void;
};

export function HomeScreen({ appData, onComplete }: HomeScreenProps) {
  const udp = appDataStorage.baseUdp(appData.completedTaskIds);
  const progressPercent = Math.min(100, (udp / DAILY_GOAL) * 100);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Daily Dashboard</Text>
        <Text style={styles.subtitle}>Complete quick actions and build your streaks.</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Universal Daily Point</Text>
          <Text style={styles.bigNumber}>
            {udp}/{DAILY_GOAL}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.smallMuted}>🔥 Global streak: {appData.globalStreak} days</Text>
          <Text style={styles.smallMuted}>⭐ Total XP: {appData.totalXp}</Text>
        </View>

        <Text style={styles.sectionTitle}>Today’s Actions</Text>
        <TaskList tasks={TASKS} completedTaskIds={appData.completedTaskIds} onComplete={onComplete} showArea />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f7fb' },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 28, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 15, color: '#4b5563' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937', marginTop: 8 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  cardLabel: { fontSize: 14, color: '#6b7280', fontWeight: '600' },
  bigNumber: { fontSize: 28, color: '#111827', fontWeight: '700' },
  progressTrack: {
    height: 10,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#1a73e8' },
  smallMuted: { color: '#6b7280', fontSize: 13 },
});
