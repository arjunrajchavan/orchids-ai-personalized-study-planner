"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StudyPlan, ScheduledSession, StudyTask } from "@/lib/types";
import {
  Calendar,
  Clock,
  BookOpen,
  Zap,
  ChevronRight,
  Target,
  TrendingUp,
} from "lucide-react";

interface StudyPlanViewProps {
  plan: StudyPlan | null;
  onGeneratePlan: () => void;
  onTaskClick: (task: StudyTask) => void;
}

const difficultyColors = {
  easy: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  hard: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

const subjectColors: Record<string, string> = {
  Mathematics: "from-violet-600 to-indigo-600",
  Physics: "from-cyan-600 to-blue-600",
  "Computer Science": "from-emerald-600 to-teal-600",
  default: "from-slate-600 to-gray-600",
};

function formatDate(date: Date): string {
  const d = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";

  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function groupSessionsByDate(sessions: ScheduledSession[]): Map<string, ScheduledSession[]> {
  const grouped = new Map<string, ScheduledSession[]>();
  sessions.forEach((session) => {
    const dateKey = new Date(session.date).toDateString();
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(session);
  });
  return grouped;
}

export function StudyPlanView({ plan, onGeneratePlan, onTaskClick }: StudyPlanViewProps) {
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  if (!plan) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/20 bg-gradient-to-br from-slate-900/50 to-slate-800/50">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
            <div className="relative p-6 rounded-full bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30">
              <Calendar className="w-12 h-12 text-violet-400" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-foreground">No Study Plan Yet</h3>
            <p className="text-muted-foreground max-w-sm">
              Generate an AI-optimized study schedule based on your tasks, exams, and available time.
            </p>
          </div>
          <Button
            onClick={onGeneratePlan}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25"
          >
            <Zap className="w-4 h-4 mr-2" />
            Generate Smart Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  const groupedSessions = groupSessionsByDate(plan.sessions);
  const completedSessions = plan.sessions.filter(
    (s) => s.task.status === "completed"
  ).length;
  const progressPercent = (completedSessions / plan.sessions.length) * 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border-violet-500/20">
          <CardContent className="pt-4 pb-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-violet-500/20">
              <Clock className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{plan.totalStudyHours}h</p>
              <p className="text-xs text-muted-foreground">Total Study Time</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-600/10 to-teal-600/10 border-emerald-500/20">
          <CardContent className="pt-4 pb-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{plan.tasksIncluded}</p>
              <p className="text-xs text-muted-foreground">Tasks Scheduled</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-600/10 to-orange-600/10 border-amber-500/20">
          <CardContent className="pt-4 pb-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/20">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{plan.sessions.length}</p>
              <p className="text-xs text-muted-foreground">Study Sessions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Overall Progress</span>
            <span className="text-sm font-medium text-foreground">
              {completedSessions}/{plan.sessions.length} sessions
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-violet-400" />
              Your Schedule
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onGeneratePlan}
              className="text-violet-400 hover:text-violet-300"
            >
              <Zap className="w-4 h-4 mr-1" />
              Regenerate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {Array.from(groupedSessions.entries()).map(([dateKey, sessions]) => {
                const isExpanded = expandedDate === dateKey || expandedDate === null;
                const dateDisplay = formatDate(new Date(dateKey));
                const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);

                return (
                  <motion.div
                    key={dateKey}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <button
                      onClick={() => setExpandedDate(isExpanded ? "" : dateKey)}
                      className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-violet-500" />
                        <span className="font-medium text-foreground">{dateDisplay}</span>
                        <Badge variant="secondary" className="text-xs">
                          {sessions.length} sessions
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Clock className="w-3.5 h-3.5" />
                        {Math.round(totalMinutes / 60 * 10) / 10}h
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-6 space-y-2"
                        >
                          {sessions.map((session, idx) => (
                            <motion.button
                              key={session.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              onClick={() => onTaskClick(session.task)}
                              className="w-full text-left"
                            >
                              <div
                                className={`p-3 rounded-lg border border-slate-700/50 bg-gradient-to-r ${
                                  subjectColors[session.task.subject] || subjectColors.default
                                } bg-opacity-10 hover:bg-opacity-20 transition-all`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground truncate">
                                      {session.task.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                      <span>{session.task.subject}</span>
                                      <span>•</span>
                                      <span>
                                        {session.startTime} - {session.endTime}
                                      </span>
                                    </div>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={difficultyColors[session.task.difficulty]}
                                  >
                                    {session.task.difficulty}
                                  </Badge>
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
