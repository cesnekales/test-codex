import AsyncStorage from '@react-native-async-storage/async-storage';
import { Area, TASKS, Task } from '../constants/tasks';

export type AppData = {
  date: string;
  completedTaskIds: string[];
  totalXp: number;
  globalStreak: number;
  areaStreaks: Record<Area, number>;
};

const STORAGE_KEY = 'mindset-stack-data-v2';

const defaultAreaStreaks: Record<Area, number> = {
  Study: 0,
  Work: 0,
  Sport: 0,
  Relationships: 0,
  Nutrition: 0,
};

const todayKey = () => new Date().toISOString().slice(0, 10);

export const getInitialData = (): AppData => ({
  date: todayKey(),
  completedTaskIds: [],
  totalXp: 0,
  globalStreak: 0,
  areaStreaks: { ...defaultAreaStreaks },
});

const readData = async (): Promise<AppData> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return getInitialData();

  const parsed = JSON.parse(raw) as AppData;
  if (parsed.date === todayKey()) return parsed;

  return {
    ...parsed,
    date: todayKey(),
    completedTaskIds: [],
  };
};

const writeData = async (data: AppData) => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));

const areaBonus = (completedTaskIds: string[]) => {
  const uniqueAreas = new Set(
    completedTaskIds
      .map((id) => TASKS.find((task) => task.id === id)?.area)
      .filter((area): area is Area => Boolean(area))
  );

  let bonus = 0;
  if (uniqueAreas.size >= 3) bonus += 5;
  if (uniqueAreas.size === 5) bonus += 10;
  return bonus;
};

const baseUdp = (completedTaskIds: string[]) =>
  completedTaskIds.reduce((sum, id) => sum + (TASKS.find((task) => task.id === id)?.points ?? 0), 0);

const shouldIncreaseAreaStreak = (task: Task, completedTaskIds: string[]) => {
  const areaTaskIds = TASKS.filter((candidate) => candidate.area === task.area).map((candidate) => candidate.id);
  return areaTaskIds.every((id) => completedTaskIds.includes(id));
};

export const appDataStorage = {
  readData,
  writeData,
  baseUdp,
  areaBonus,
  async completeTask(current: AppData, task: Task): Promise<AppData> {
    if (current.completedTaskIds.includes(task.id)) {
      return current;
    }

    const completedTaskIds = [...current.completedTaskIds, task.id];
    const pointsAwarded = task.points + areaBonus(completedTaskIds);
    const udpNow = baseUdp(completedTaskIds);

    const next: AppData = {
      ...current,
      completedTaskIds,
      totalXp: current.totalXp + pointsAwarded,
      areaStreaks: {
        ...current.areaStreaks,
        [task.area]: shouldIncreaseAreaStreak(task, completedTaskIds)
          ? current.areaStreaks[task.area] + 1
          : current.areaStreaks[task.area],
      },
      globalStreak: current.completedTaskIds.length === 0 && udpNow >= 30 ? current.globalStreak + 1 : current.globalStreak,
    };

    await writeData(next);
    return next;
  },
};
