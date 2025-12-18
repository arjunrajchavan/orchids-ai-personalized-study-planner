import { StudyTask, Exam, TimeSlot, ScheduledSession, StudyPlan } from './types';

interface PriorityScore {
  task: StudyTask;
  score: number;
}

const DIFFICULTY_WEIGHTS = { easy: 1, medium: 1.5, hard: 2 };
const PRIORITY_WEIGHTS = { low: 1, medium: 2, high: 3, urgent: 5 };
const STATUS_WEIGHTS = { pending: 1, in_progress: 1.2, completed: 0, overdue: 2 };

function calculateTaskPriority(task: StudyTask, exams: Exam[]): number {
  if (task.status === 'completed') return 0;

  const now = new Date();
  const dueDate = new Date(task.dueDate);
  const daysUntilDue = Math.max(0, Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  
  let examProximityBonus = 0;
  if (task.relatedExamId) {
    const exam = exams.find(e => e.id === task.relatedExamId);
    if (exam) {
      const daysUntilExam = Math.max(0, Math.ceil((new Date(exam.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      examProximityBonus = Math.max(0, (30 - daysUntilExam) * (exam.weight / 10));
    }
  }

  const urgencyScore = daysUntilDue <= 0 ? 100 : Math.max(0, 50 - daysUntilDue * 2);
  const difficultyScore = DIFFICULTY_WEIGHTS[task.difficulty] * 10;
  const priorityScore = PRIORITY_WEIGHTS[task.priority] * 15;
  const statusScore = STATUS_WEIGHTS[task.status] * 10;

  return urgencyScore + difficultyScore + priorityScore + statusScore + examProximityBonus;
}

function getNextAvailableSlot(
  date: Date,
  timeSlots: TimeSlot[],
  usedSlots: Map<string, number>
): { date: Date; slot: TimeSlot; availableMinutes: number } | null {
  const maxDaysAhead = 30;
  const currentDate = new Date(date);

  for (let i = 0; i < maxDaysAhead; i++) {
    const dayOfWeek = currentDate.getDay();
    const daySlots = timeSlots.filter(s => s.dayOfWeek === dayOfWeek && s.isAvailable);

    for (const slot of daySlots) {
      const slotKey = `${currentDate.toDateString()}-${slot.id}`;
      const usedMinutes = usedSlots.get(slotKey) || 0;
      const totalMinutes = (slot.endHour - slot.startHour) * 60;
      const availableMinutes = totalMinutes - usedMinutes;

      if (availableMinutes >= 30) {
        return { date: new Date(currentDate), slot, availableMinutes };
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return null;
}

function formatTime(hour: number, minute: number = 0): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

export function generateStudyPlan(
  tasks: StudyTask[],
  exams: Exam[],
  timeSlots: TimeSlot[]
): StudyPlan {
  const incompleteTasks = tasks.filter(t => t.status !== 'completed');
  
  const prioritizedTasks: PriorityScore[] = incompleteTasks
    .map(task => ({
      task,
      score: calculateTaskPriority(task, exams),
    }))
    .sort((a, b) => b.score - a.score);

  const sessions: ScheduledSession[] = [];
  const usedSlots = new Map<string, number>();
  let currentDate = new Date();

  for (const { task } of prioritizedTasks) {
    let remainingMinutes = task.estimatedMinutes;
    let sessionCount = 0;

    while (remainingMinutes > 0 && sessionCount < 5) {
      const slotInfo = getNextAvailableSlot(currentDate, timeSlots, usedSlots);
      if (!slotInfo) break;

      const { date, slot, availableMinutes } = slotInfo;
      const sessionDuration = Math.min(remainingMinutes, availableMinutes, 120);

      const slotKey = `${date.toDateString()}-${slot.id}`;
      const usedMinutes = usedSlots.get(slotKey) || 0;
      const startMinute = usedMinutes;
      const startHour = slot.startHour + Math.floor(startMinute / 60);
      const startMinuteOfHour = startMinute % 60;

      const endMinute = startMinute + sessionDuration;
      const endHour = slot.startHour + Math.floor(endMinute / 60);
      const endMinuteOfHour = endMinute % 60;

      sessions.push({
        id: `session-${sessions.length + 1}`,
        taskId: task.id,
        task,
        date: new Date(date),
        startTime: formatTime(startHour, startMinuteOfHour),
        endTime: formatTime(endHour, endMinuteOfHour),
        durationMinutes: sessionDuration,
      });

      usedSlots.set(slotKey, usedMinutes + sessionDuration);
      remainingMinutes -= sessionDuration;
      sessionCount++;
    }
  }

  sessions.sort((a, b) => {
    const dateCompare = a.date.getTime() - b.date.getTime();
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  return {
    id: `plan-${Date.now()}`,
    generatedAt: new Date(),
    sessions,
    totalStudyHours: Math.round((totalMinutes / 60) * 10) / 10,
    tasksIncluded: new Set(sessions.map(s => s.taskId)).size,
  };
}

export function getStudyTip(task: StudyTask): string {
  const tips = {
    easy: [
      "Light review session - perfect for warming up!",
      "Use flashcards for quick memorization.",
      "Great task for a study break filler.",
    ],
    medium: [
      "Focus for 25 minutes, then take a 5-minute break.",
      "Try explaining concepts aloud to reinforce learning.",
      "Mix practice problems with reading material.",
    ],
    hard: [
      "Break this into smaller chunks for better retention.",
      "Schedule this during your peak focus hours.",
      "Consider group study for complex topics.",
    ],
  };

  const taskTips = tips[task.difficulty];
  return taskTips[Math.floor(Math.random() * taskTips.length)];
}
