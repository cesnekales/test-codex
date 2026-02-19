import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import { Area, TASKS, Task } from '../constants/tasks';
import { TaskList } from '../components/TaskList';
import { AppData } from '../storage/appData';

type AreaScreenProps = {
  area: Area;
  appData: AppData;
  onComplete: (task: Task) => void;
};

export function AreaScreen({ area, appData, onComplete }: AreaScreenProps) {
  const tasks = TASKS.filter((task) => task.area === area);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{area}</Text>
        <Text style={styles.subtitle}>Current streak: {appData.areaStreaks[area]} days</Text>

        <TaskList tasks={tasks} completedTaskIds={appData.completedTaskIds} onComplete={onComplete} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f7fb' },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 28, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 15, color: '#4b5563', marginBottom: 6 },
});
