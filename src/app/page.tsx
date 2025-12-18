"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { StudyTask, Exam, StudyPlan } from "@/lib/types";
import { mockTasks, mockExams, defaultTimeSlots } from "@/lib/mock-data";
import { generateStudyPlan } from "@/lib/study-plan-generator";
import { TaskManager } from "@/components/task-manager";
import { StudyPlanView } from "@/components/study-plan-view";
import { StudyChatbot } from "@/components/study-chatbot";
import { ExamOverview } from "@/components/exam-overview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Brain,
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  const [tasks, setTasks] = useState<StudyTask[]>(mockTasks);
  const [exams] = useState<Exam[]>(mockExams);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [selectedTask, setSelectedTask] = useState<StudyTask | null>(null);
  const [showChat, setShowChat] = useState(true);

  const handleAddTask = useCallback((taskData: Omit<StudyTask, "id">) => {
    const newTask: StudyTask = {
      ...taskData,
      id: `task-${Date.now()}`,
    };
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const handleUpdateTask = useCallback((updatedTask: StudyTask) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  }, [selectedTask]);

  const handleGeneratePlan = useCallback(() => {
    const plan = generateStudyPlan(tasks, exams, defaultTimeSlots);
    setStudyPlan(plan);
  }, [tasks, exams]);

  const handleTaskClick = useCallback((task: StudyTask) => {
    setSelectedTask(task);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-foreground">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/20 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/10 via-transparent to-transparent pointer-events-none" />

      <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-violet-500/30 blur-lg rounded-full" />
                <div className="relative p-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  StudyFlow AI
                </h1>
                <p className="text-xs text-muted-foreground">
                  Personalized Learning System
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1.5">
                <Sparkles className="w-3 h-3" />
                AI-Powered
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChat(!showChat)}
                className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {showChat ? "Hide" : "Show"} Assistant
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Study Planner</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, Student
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your tasks, generate smart study plans, and chat with your AI
            assistant.
          </p>
        </motion.div>

        <div className="grid grid-cols-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-12 lg:col-span-5"
          >
            <TaskManager
              tasks={tasks}
              exams={exams}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onSelectTask={handleTaskClick}
              selectedTaskId={selectedTask?.id}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${showChat ? "col-span-12 lg:col-span-4" : "col-span-12 lg:col-span-7"}`}
          >
            <div className="space-y-6">
              <StudyPlanView
                plan={studyPlan}
                onGeneratePlan={handleGeneratePlan}
                onTaskClick={handleTaskClick}
              />
              <ExamOverview exams={exams} tasks={tasks} />
            </div>
          </motion.div>

          {showChat && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: 0.3 }}
              className="col-span-12 lg:col-span-3"
            >
              <div className="sticky top-24 h-[calc(100vh-8rem)]">
                <StudyChatbot
                  tasks={tasks}
                  exams={exams}
                  plan={studyPlan}
                  onAddTask={handleAddTask}
                  onGeneratePlan={handleGeneratePlan}
                />
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-800/50 bg-[#0a0a0f]/80 mt-12">
        <div className="max-w-[1800px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>StudyFlow AI - Personalized Learning System</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Built with Next.js & AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
