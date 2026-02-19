export type Area = 'Study' | 'Work' | 'Sport' | 'Relationships' | 'Nutrition';

export type Task = {
  id: string;
  title: string;
  area: Area;
  points: number;
};

export const AREA_ORDER: Area[] = ['Study', 'Work', 'Sport', 'Relationships', 'Nutrition'];

export const DAILY_GOAL = 100;

export const TASKS: Task[] = [
  { id: 'study-1', title: 'Read for 20 minutes', area: 'Study', points: 20 },
  { id: 'work-1', title: 'Finish top-priority task', area: 'Work', points: 20 },
  { id: 'sport-1', title: 'Complete a 30-minute workout', area: 'Sport', points: 25 },
  { id: 'relationships-1', title: 'Reach out to one friend/family member', area: 'Relationships', points: 15 },
  { id: 'nutrition-1', title: 'Hit hydration target', area: 'Nutrition', points: 20 },
  { id: 'study-2', title: 'Answer a short quiz', area: 'Study', points: 10 },
  { id: 'work-2', title: 'Do one focused 25-min sprint', area: 'Work', points: 10 },
  { id: 'nutrition-2', title: 'Log one balanced meal', area: 'Nutrition', points: 10 },
];
