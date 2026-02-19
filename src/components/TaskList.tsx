import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Task } from '../constants/tasks';

type TaskListProps = {
  tasks: Task[];
  completedTaskIds: string[];
  onComplete: (task: Task) => void;
  showArea?: boolean;
};

export function TaskList({ tasks, completedTaskIds, onComplete, showArea = false }: TaskListProps) {
  const completedSet = new Set(completedTaskIds);

  return (
    <View style={styles.container}>
      {tasks.map((task) => {
        const completed = completedSet.has(task.id);

        return (
          <View key={task.id} style={styles.row}>
            <View style={styles.textWrap}>
              <Text style={styles.title}>{task.title}</Text>
              <Text style={styles.meta}>
                {showArea ? `${task.area} • ` : ''}
                {task.points} pts
              </Text>
            </View>
            <Pressable
              style={[styles.button, completed && styles.buttonDone]}
              onPress={() => onComplete(task)}
              disabled={completed}
            >
              <Text style={styles.buttonText}>{completed ? 'Done' : 'Complete'}</Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  row: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textWrap: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: '#111827' },
  meta: { marginTop: 4, fontSize: 12, color: '#6b7280' },
  button: {
    minWidth: 92,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: '#1a73e8',
  },
  buttonDone: { backgroundColor: '#9ca3af' },
  buttonText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
});
