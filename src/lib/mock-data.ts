import { StudyTask, Exam, TimeSlot } from './types';

const today = new Date();
const addDays = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d;
};

export const mockExams: Exam[] = [
  {
    id: 'exam-1',
    title: 'Calculus II Midterm',
    subject: 'Mathematics',
    date: addDays(14),
    weight: 30,
    topics: ['Integration', 'Differential Equations', 'Series'],
  },
  {
    id: 'exam-2',
    title: 'Physics Final',
    subject: 'Physics',
    date: addDays(21),
    weight: 40,
    topics: ['Thermodynamics', 'Electromagnetism', 'Quantum Basics'],
  },
  {
    id: 'exam-3',
    title: 'Data Structures Quiz',
    subject: 'Computer Science',
    date: addDays(7),
    weight: 15,
    topics: ['Trees', 'Graphs', 'Hash Tables'],
  },
];

export const mockTasks: StudyTask[] = [
  {
    id: 'task-1',
    title: 'Review Integration Techniques',
    subject: 'Mathematics',
    difficulty: 'hard',
    status: 'pending',
    priority: 'high',
    estimatedMinutes: 90,
    dueDate: addDays(10),
    relatedExamId: 'exam-1',
  },
  {
    id: 'task-2',
    title: 'Practice Differential Equations',
    subject: 'Mathematics',
    difficulty: 'hard',
    status: 'in_progress',
    priority: 'urgent',
    estimatedMinutes: 120,
    dueDate: addDays(8),
    relatedExamId: 'exam-1',
  },
  {
    id: 'task-3',
    title: 'Read Thermodynamics Chapter',
    subject: 'Physics',
    difficulty: 'medium',
    status: 'pending',
    priority: 'medium',
    estimatedMinutes: 60,
    dueDate: addDays(15),
    relatedExamId: 'exam-2',
  },
  {
    id: 'task-4',
    title: 'Complete Binary Tree Exercises',
    subject: 'Computer Science',
    difficulty: 'medium',
    status: 'completed',
    priority: 'high',
    estimatedMinutes: 45,
    dueDate: addDays(5),
    relatedExamId: 'exam-3',
    completedAt: addDays(-1),
  },
  {
    id: 'task-5',
    title: 'Graph Algorithms Practice',
    subject: 'Computer Science',
    difficulty: 'hard',
    status: 'pending',
    priority: 'urgent',
    estimatedMinutes: 75,
    dueDate: addDays(5),
    relatedExamId: 'exam-3',
  },
  {
    id: 'task-6',
    title: 'Electromagnetism Problem Set',
    subject: 'Physics',
    difficulty: 'hard',
    status: 'pending',
    priority: 'medium',
    estimatedMinutes: 90,
    dueDate: addDays(18),
    relatedExamId: 'exam-2',
  },
  {
    id: 'task-7',
    title: 'Series Convergence Review',
    subject: 'Mathematics',
    difficulty: 'medium',
    status: 'pending',
    priority: 'low',
    estimatedMinutes: 45,
    dueDate: addDays(12),
    relatedExamId: 'exam-1',
  },
];

export const defaultTimeSlots: TimeSlot[] = [
  { id: 'slot-1', dayOfWeek: 1, startHour: 9, endHour: 12, isAvailable: true },
  { id: 'slot-2', dayOfWeek: 1, startHour: 14, endHour: 17, isAvailable: true },
  { id: 'slot-3', dayOfWeek: 2, startHour: 10, endHour: 13, isAvailable: true },
  { id: 'slot-4', dayOfWeek: 2, startHour: 15, endHour: 18, isAvailable: true },
  { id: 'slot-5', dayOfWeek: 3, startHour: 9, endHour: 12, isAvailable: true },
  { id: 'slot-6', dayOfWeek: 3, startHour: 14, endHour: 16, isAvailable: true },
  { id: 'slot-7', dayOfWeek: 4, startHour: 11, endHour: 14, isAvailable: true },
  { id: 'slot-8', dayOfWeek: 4, startHour: 16, endHour: 19, isAvailable: true },
  { id: 'slot-9', dayOfWeek: 5, startHour: 9, endHour: 11, isAvailable: true },
  { id: 'slot-10', dayOfWeek: 5, startHour: 13, endHour: 16, isAvailable: true },
  { id: 'slot-11', dayOfWeek: 6, startHour: 10, endHour: 14, isAvailable: true },
  { id: 'slot-12', dayOfWeek: 0, startHour: 14, endHour: 18, isAvailable: true },
];
