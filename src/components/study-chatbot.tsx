"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ChatMessage, StudyTask, Exam, StudyPlan } from "@/lib/types";
import { getStudyTip } from "@/lib/study-plan-generator";
import {
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  Calendar,
  Plus,
  RefreshCw,
  HelpCircle,
  Lightbulb,
  MessageSquare,
} from "lucide-react";

interface StudyChatbotProps {
  tasks: StudyTask[];
  exams: Exam[];
  plan: StudyPlan | null;
  onAddTask: (task: Omit<StudyTask, "id">) => void;
  onGeneratePlan: () => void;
}

const quickActions = [
  { icon: Plus, label: "Add a task", command: "add task" },
  { icon: Calendar, label: "Generate plan", command: "generate plan" },
  { icon: BookOpen, label: "Study tips", command: "study tips" },
  { icon: HelpCircle, label: "Help", command: "help" },
];

function parseTaskFromMessage(message: string): Partial<Omit<StudyTask, "id">> | null {
  const addTaskPatterns = [
    /add (?:a )?task[:\s]+(.+?)(?:\s+for\s+(\w+))?(?:\s+due\s+(.+))?$/i,
    /create (?:a )?task[:\s]+(.+?)(?:\s+for\s+(\w+))?(?:\s+due\s+(.+))?$/i,
    /new task[:\s]+(.+?)(?:\s+for\s+(\w+))?(?:\s+due\s+(.+))?$/i,
  ];

  for (const pattern of addTaskPatterns) {
    const match = message.match(pattern);
    if (match) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      return {
        title: match[1].trim(),
        subject: match[2] || "General",
        difficulty: "medium",
        priority: "medium",
        status: "pending",
        estimatedMinutes: 60,
        dueDate,
      };
    }
  }

  return null;
}

function generateBotResponse(
  message: string,
  tasks: StudyTask[],
  exams: Exam[],
  plan: StudyPlan | null
): { content: string; actionType?: ChatMessage["actionType"] } {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("help")) {
    return {
      content: `I'm your AI study assistant! Here's what I can help you with:

**Commands:**
• "Add task: [title] for [subject]" - Create a new study task
• "Generate plan" or "Create schedule" - Build an optimized study schedule
• "Study tips" - Get personalized study recommendations
• "Show tasks" or "My tasks" - View your current tasks
• "Upcoming exams" - See your scheduled exams

**Quick Tips:**
• I prioritize tasks based on difficulty, deadlines, and exam proximity
• Hard tasks get scheduled during your peak focus hours
• I break long study sessions into manageable chunks

How can I help you study smarter today?`,
      actionType: "info",
    };
  }

  if (lowerMessage.includes("generate plan") || lowerMessage.includes("create schedule") || lowerMessage.includes("make schedule")) {
    const incompleteTasks = tasks.filter(t => t.status !== "completed");
    if (incompleteTasks.length === 0) {
      return {
        content: "You don't have any pending tasks to schedule! Add some study tasks first, then I can create an optimized plan for you.",
        actionType: "info",
      };
    }
    return {
      content: `Perfect! I'll generate an optimized study plan for your ${incompleteTasks.length} pending tasks. The plan considers:

• Task difficulty and priority
• Upcoming exam deadlines
• Your available time slots
• Optimal session lengths (max 2 hours)

Click the "Generate Smart Plan" button in the Study Plan section to see your personalized schedule!`,
      actionType: "generate_plan",
    };
  }

  if (lowerMessage.includes("study tip") || lowerMessage.includes("advice") || lowerMessage.includes("recommendation")) {
    const activeTasks = tasks.filter(t => t.status !== "completed");
    if (activeTasks.length > 0) {
      const randomTask = activeTasks[Math.floor(Math.random() * activeTasks.length)];
      const tip = getStudyTip(randomTask);
      return {
        content: `**Study Tip for "${randomTask.title}":**\n\n${tip}\n\n**General Tips:**\n• Use the Pomodoro technique: 25 min focus, 5 min break\n• Review notes within 24 hours for better retention\n• Practice active recall instead of passive reading\n• Get 7-8 hours of sleep before exams`,
        actionType: "info",
      };
    }
    return {
      content: `**Study Tips:**\n\n1. **Active Recall**: Test yourself instead of just reading\n2. **Spaced Repetition**: Review material at increasing intervals\n3. **Pomodoro Technique**: 25 min work, 5 min break\n4. **Sleep Well**: Memory consolidation happens during sleep\n5. **Exercise**: Physical activity boosts cognitive function`,
      actionType: "info",
    };
  }

  if (lowerMessage.includes("show task") || lowerMessage.includes("my task") || lowerMessage.includes("list task")) {
    const pending = tasks.filter(t => t.status === "pending").length;
    const inProgress = tasks.filter(t => t.status === "in_progress").length;
    const completed = tasks.filter(t => t.status === "completed").length;

    const urgentTasks = tasks.filter(t => t.priority === "urgent" && t.status !== "completed");
    const urgentList = urgentTasks.length > 0
      ? `\n\n**Urgent Tasks:**\n${urgentTasks.map(t => `• ${t.title}`).join("\n")}`
      : "";

    return {
      content: `**Your Task Summary:**\n\n📋 Total: ${tasks.length} tasks\n⏳ Pending: ${pending}\n🔄 In Progress: ${inProgress}\n✅ Completed: ${completed}${urgentList}\n\nUse the Task Manager on the left to view and manage all your tasks!`,
      actionType: "info",
    };
  }

  if (lowerMessage.includes("exam") || lowerMessage.includes("test")) {
    if (exams.length === 0) {
      return {
        content: "You don't have any exams scheduled yet. Add exams to help me prioritize your study tasks better!",
        actionType: "info",
      };
    }

    const sortedExams = [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const examList = sortedExams.map(exam => {
      const daysUntil = Math.ceil((new Date(exam.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return `• **${exam.title}** (${exam.subject}) - ${daysUntil} days away, ${exam.weight}% weight`;
    }).join("\n");

    return {
      content: `**Upcoming Exams:**\n\n${examList}\n\nI'll prioritize tasks related to your nearest exams when generating your study plan!`,
      actionType: "info",
    };
  }

  if (lowerMessage.includes("add task") || lowerMessage.includes("create task") || lowerMessage.includes("new task")) {
    const parsed = parseTaskFromMessage(message);
    if (parsed && parsed.title) {
      return {
        content: `I'll add the task "${parsed.title}" for ${parsed.subject}. Check the Task Manager to customize the difficulty, priority, and due date!`,
        actionType: "add_task",
      };
    }
    return {
      content: `To add a task, you can say:\n• "Add task: Review Chapter 5 for Mathematics"\n• "Create task: Practice problems due Friday"\n\nOr use the "Add Task" button in the Task Manager for more options!`,
      actionType: "info",
    };
  }

  if (plan && (lowerMessage.includes("schedule") || lowerMessage.includes("plan"))) {
    return {
      content: `**Your Current Study Plan:**\n\n📚 ${plan.tasksIncluded} tasks scheduled\n⏱️ ${plan.totalStudyHours} hours of study time\n📅 ${plan.sessions.length} study sessions\n\nYour plan is optimized based on task priorities and exam deadlines. Check the Study Plan section to see your full schedule!`,
      actionType: "info",
    };
  }

  const greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"];
  if (greetings.some(g => lowerMessage.includes(g))) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    return {
      content: `${greeting}! I'm your AI study assistant. I can help you:\n\n• Create and manage study tasks\n• Generate optimized study schedules\n• Provide study tips and recommendations\n\nWhat would you like to work on today?`,
      actionType: "info",
    };
  }

  return {
    content: `I'm not sure how to help with that specific request, but I can assist you with:\n\n• **Task Management**: "Add task", "Show my tasks"\n• **Study Planning**: "Generate plan", "Show schedule"\n• **Study Tips**: "Give me study tips"\n• **Exam Info**: "Show upcoming exams"\n\nType "help" for more detailed instructions!`,
    actionType: "info",
  };
}

export function StudyChatbot({ tasks, exams, plan, onAddTask, onGeneratePlan }: StudyChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your AI study assistant. I can help you create study tasks, generate optimized schedules, and provide study tips. What would you like to work on?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

    const response = generateBotResponse(input.trim(), tasks, exams, plan);

    if (response.actionType === "add_task") {
      const parsed = parseTaskFromMessage(input.trim());
      if (parsed && parsed.title) {
        onAddTask({
          title: parsed.title,
          subject: parsed.subject || "General",
          difficulty: "medium",
          priority: "medium",
          status: "pending",
          estimatedMinutes: 60,
          dueDate: parsed.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
      }
    }

    if (response.actionType === "generate_plan") {
      onGeneratePlan();
    }

    const botMessage: ChatMessage = {
      id: `bot-${Date.now()}`,
      role: "assistant",
      content: response.content,
      timestamp: new Date(),
      actionType: response.actionType,
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, botMessage]);
  };

  const handleQuickAction = (command: string) => {
    setInput(command);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 flex flex-col h-full">
      <CardHeader className="pb-3 border-b border-slate-700/50">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-600/20 to-indigo-600/20">
            <Bot className="w-5 h-5 text-violet-400" />
          </div>
          Study Assistant
          <Badge variant="secondary" className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <Sparkles className="w-3 h-3 mr-1" />
            AI
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-violet-600 to-indigo-600"
                        : "bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/30"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>

                  <div
                    className={`flex-1 max-w-[85%] ${
                      message.role === "user" ? "text-right" : ""
                    }`}
                  >
                    <div
                      className={`inline-block px-4 py-2.5 rounded-2xl text-sm ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-md"
                          : "bg-slate-800/70 text-foreground rounded-tl-md border border-slate-700/50"
                      }`}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {message.content.split("**").map((part, idx) =>
                          idx % 2 === 1 ? (
                            <strong key={idx} className="font-semibold">{part}</strong>
                          ) : (
                            part
                          )
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 px-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="bg-slate-800/70 border border-slate-700/50 px-4 py-3 rounded-2xl rounded-tl-md">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-violet-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-slate-700/50 space-y-3">
          <div className="flex gap-2 flex-wrap">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.command)}
                className="text-xs bg-slate-800/50 border-slate-700 hover:bg-slate-700/50"
              >
                <action.icon className="w-3 h-3 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Ask me anything about studying..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              className="bg-slate-800/50 border-slate-700 focus-visible:ring-violet-500/50"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
