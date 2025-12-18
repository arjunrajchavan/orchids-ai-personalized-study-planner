"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudyTask, Exam, TaskDifficulty, TaskStatus, TaskPriority } from "@/lib/types";
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Trash2,
  Edit3,
  BookMarked,
  GraduationCap,
} from "lucide-react";

interface TaskManagerProps {
  tasks: StudyTask[];
  exams: Exam[];
  onAddTask: (task: Omit<StudyTask, "id">) => void;
  onUpdateTask: (task: StudyTask) => void;
  onDeleteTask: (taskId: string) => void;
  onSelectTask: (task: StudyTask) => void;
  selectedTaskId?: string;
}

const statusConfig = {
  pending: { icon: Circle, color: "text-slate-400", bg: "bg-slate-500/20" },
  in_progress: { icon: Clock, color: "text-blue-400", bg: "bg-blue-500/20" },
  completed: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/20" },
  overdue: { icon: AlertTriangle, color: "text-rose-400", bg: "bg-rose-500/20" },
};

const priorityColors = {
  low: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  medium: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  high: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  urgent: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

const difficultyColors = {
  easy: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  hard: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

function formatDueDate(date: Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays <= 7) return `${diffDays}d left`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TaskManager({
  tasks,
  exams,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onSelectTask,
  selectedTaskId,
}: TaskManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    difficulty: "medium" as TaskDifficulty,
    priority: "medium" as TaskPriority,
    estimatedMinutes: 60,
    dueDate: new Date().toISOString().split("T")[0],
    relatedExamId: "",
    notes: "",
  });

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const statusOrder = { overdue: 0, in_progress: 1, pending: 2, completed: 3 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    if (editingTask) {
      onUpdateTask({
        ...editingTask,
        ...formData,
        dueDate: new Date(formData.dueDate),
        relatedExamId: formData.relatedExamId || undefined,
      });
    } else {
      onAddTask({
        ...formData,
        status: "pending",
        dueDate: new Date(formData.dueDate),
        relatedExamId: formData.relatedExamId || undefined,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subject: "",
      difficulty: "medium",
      priority: "medium",
      estimatedMinutes: 60,
      dueDate: new Date().toISOString().split("T")[0],
      relatedExamId: "",
      notes: "",
    });
    setEditingTask(null);
    setIsAddDialogOpen(false);
  };

  const openEditDialog = (task: StudyTask) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      subject: task.subject,
      difficulty: task.difficulty,
      priority: task.priority,
      estimatedMinutes: task.estimatedMinutes,
      dueDate: new Date(task.dueDate).toISOString().split("T")[0],
      relatedExamId: task.relatedExamId || "",
      notes: task.notes || "",
    });
    setIsAddDialogOpen(true);
  };

  const toggleTaskStatus = (task: StudyTask) => {
    const newStatus: TaskStatus =
      task.status === "completed" ? "pending" : "completed";
    onUpdateTask({
      ...task,
      status: newStatus,
      completedAt: newStatus === "completed" ? new Date() : undefined,
    });
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    pending: tasks.filter((t) => t.status === "pending").length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: taskStats.total, color: "from-slate-600 to-slate-700" },
          { label: "Pending", value: taskStats.pending, color: "from-amber-600 to-orange-600" },
          { label: "In Progress", value: taskStats.inProgress, color: "from-blue-600 to-cyan-600" },
          { label: "Completed", value: taskStats.completed, color: "from-emerald-600 to-teal-600" },
        ].map((stat) => (
          <Card key={stat.label} className={`bg-gradient-to-br ${stat.color} border-none`}>
            <CardContent className="pt-3 pb-3">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/70">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-violet-400" />
              Study Tasks
            </CardTitle>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-800/50 border-slate-700"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-slate-800/50 border-slate-700">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {sortedTasks.map((task) => {
                  const StatusIcon = statusConfig[task.status].icon;
                  const isSelected = task.id === selectedTaskId;

                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`group p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-violet-500/10 border-violet-500/50"
                          : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50"
                      }`}
                      onClick={() => onSelectTask(task)}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskStatus(task);
                          }}
                          className={`mt-0.5 p-1 rounded-full transition-colors ${statusConfig[task.status].bg}`}
                        >
                          <StatusIcon className={`w-4 h-4 ${statusConfig[task.status].color}`} />
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className={`font-medium truncate ${
                                task.status === "completed"
                                  ? "line-through text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {task.title}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <Badge variant="outline" className={priorityColors[task.priority]}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className={difficultyColors[task.difficulty]}>
                              {task.difficulty}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {task.subject}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span
                              className={`text-xs ${
                                task.status === "overdue" ||
                                (new Date(task.dueDate) < new Date() && task.status !== "completed")
                                  ? "text-rose-400"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {formatDueDate(task.dueDate)}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {task.estimatedMinutes}min
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(task);
                            }}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-rose-400 hover:text-rose-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTask(task.id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {sortedTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 rounded-full bg-slate-800/50 mb-4">
                    <BookMarked className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No tasks found</p>
                  <p className="text-sm text-muted-foreground/70">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Add your first study task to get started"}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-violet-400" />
              {editingTask ? "Edit Task" : "Add New Task"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Title</label>
              <Input
                placeholder="e.g., Review Chapter 5"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-slate-800/50 border-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Subject</label>
                <Input
                  placeholder="e.g., Mathematics"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="bg-slate-800/50 border-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Related Exam</label>
                <Select
                  value={formData.relatedExamId}
                  onValueChange={(v) => setFormData({ ...formData, relatedExamId: v })}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {exams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Difficulty</label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(v) =>
                    setFormData({ ...formData, difficulty: v as TaskDifficulty })
                  }
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Priority</label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) =>
                    setFormData({ ...formData, priority: v as TaskPriority })
                  }
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Estimated Time (min)</label>
                <Input
                  type="number"
                  min={15}
                  max={480}
                  value={formData.estimatedMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedMinutes: parseInt(e.target.value) || 60,
                    })
                  }
                  className="bg-slate-800/50 border-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Due Date</label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="bg-slate-800/50 border-slate-700"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-violet-600 to-indigo-600"
            >
              {editingTask ? "Save Changes" : "Add Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
