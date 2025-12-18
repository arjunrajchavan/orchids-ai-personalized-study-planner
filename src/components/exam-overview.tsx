"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Exam, StudyTask } from "@/lib/types";
import { GraduationCap, Calendar, BarChart3 } from "lucide-react";

interface ExamOverviewProps {
  exams: Exam[];
  tasks: StudyTask[];
}

const subjectColors: Record<string, string> = {
  Mathematics: "from-violet-600 to-indigo-600",
  Physics: "from-cyan-600 to-blue-600",
  "Computer Science": "from-emerald-600 to-teal-600",
};

function getDaysUntil(date: Date): number {
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function getExamProgress(examId: string, tasks: StudyTask[]): number {
  const relatedTasks = tasks.filter(t => t.relatedExamId === examId);
  if (relatedTasks.length === 0) return 0;
  const completed = relatedTasks.filter(t => t.status === "completed").length;
  return Math.round((completed / relatedTasks.length) * 100);
}

export function ExamOverview({ exams, tasks }: ExamOverviewProps) {
  const sortedExams = [...exams].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="w-5 h-5 text-violet-400" />
        <h3 className="font-semibold text-foreground">Upcoming Exams</h3>
      </div>

      <div className="grid gap-3">
        {sortedExams.map((exam, idx) => {
          const daysUntil = getDaysUntil(exam.date);
          const progress = getExamProgress(exam.id, tasks);
          const relatedTasks = tasks.filter(t => t.relatedExamId === exam.id);
          const gradient = subjectColors[exam.subject] || "from-slate-600 to-gray-600";

          return (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`bg-gradient-to-r ${gradient} border-none overflow-hidden`}>
                <CardContent className="p-4 relative">
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate">{exam.title}</h4>
                        <p className="text-xs text-white/70 mt-0.5">{exam.subject}</p>
                      </div>
                      <Badge
                        className={`shrink-0 ${
                          daysUntil <= 7
                            ? "bg-rose-500/90 text-white"
                            : "bg-white/20 text-white"
                        }`}
                      >
                        {daysUntil}d
                      </Badge>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs text-white/80">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(exam.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          {exam.weight}% weight
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/70">Preparation</span>
                          <span className="text-white font-medium">{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-white/90 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                          />
                        </div>
                        <p className="text-[10px] text-white/60">
                          {relatedTasks.filter(t => t.status === "completed").length}/
                          {relatedTasks.length} tasks completed
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
