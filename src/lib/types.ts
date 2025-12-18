export type TaskDifficulty = 'easy' | 'medium' | 'hard';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  difficulty: TaskDifficulty;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedMinutes: number;
  dueDate: Date;
  relatedExamId?: string;
  completedAt?: Date;
  notes?: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  date: Date;
  weight: number;
  topics: string[];
}

export interface TimeSlot {
  id: string;
  dayOfWeek: number;
  startHour: number;
  endHour: number;
  isAvailable: boolean;
}

export interface ScheduledSession {
  id: string;
  taskId: string;
  task: StudyTask;
  date: Date;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  actionType?: 'add_task' | 'update_task' | 'generate_plan' | 'info';
}

export interface StudyPlan {
  id: string;
  generatedAt: Date;
  sessions: ScheduledSession[];
  totalStudyHours: number;
  tasksIncluded: number;
}
