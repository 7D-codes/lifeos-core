'use client';

import { useEffect } from 'react';
import { useDashboardStore, initializeDashboard } from '@/store/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Calendar, CheckCircle2, Clock, Flame, Folder, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { TaskStatus, Priority } from '@/types';

const priorityColors: Record<Priority, string> = {
  high: 'bg-red-500/10 text-red-500 border-red-500/20',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

const statusIcons: Record<TaskStatus, React.ReactNode> = {
  todo: <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />,
  in_progress: <Clock className="w-4 h-4 text-yellow-500" />,
  done: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  blocked: <AlertTriangle className="w-4 h-4 text-red-500" />,
};

export function TodayView() {
  const {
    tasks,
    projects,
    isLoading,
    refreshData,
    getStats,
    getOverdueTasks,
    getTodaysTasks,
    getHighPriorityTasks,
    updateTaskStatus,
  } = useDashboardStore();
  
  useEffect(() => {
    initializeDashboard();
  }, []);
  
  const stats = getStats();
  const overdueTasks = getOverdueTasks();
  const todaysTasks = getTodaysTasks();
  const highPriorityTasks = getHighPriorityTasks();
  
  const handleStatusChange = (taskId: string, currentStatus: TaskStatus) => {
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      todo: 'in_progress',
      in_progress: 'done',
      done: 'todo',
      blocked: 'todo',
    };
    updateTaskStatus(taskId, nextStatus[currentStatus]);
  };
  
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Today</h1>
          <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM do')}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Active Projects</div>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Tasks</div>
            <div className="text-2xl font-bold">{stats.completedTasks}/{stats.totalTasks}</div>
          </div>
        </div>
      </div>
      
      {/* High Priority Tasks */}
      {highPriorityTasks.length > 0 && (
        <Card className="border-red-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500" />
              High Priority ({highPriorityTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {highPriorityTasks.slice(0, 5).map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  projects={projects}
                  onStatusChange={() => handleStatusChange(task.id, task.status)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Due Today */}
      {todaysTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Due Today ({todaysTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todaysTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  projects={projects}
                  onStatusChange={() => handleStatusChange(task.id, task.status)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Overdue */}
      {overdueTasks.length > 0 && (
        <Card className="border-red-500/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-red-500">
              <AlertCircle className="w-5 h-5" />
              Overdue ({overdueTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-40">
              <div className="space-y-2">
                {overdueTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    projects={projects}
                    onStatusChange={() => handleStatusChange(task.id, task.status)}
                    showDueDate
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      
      {/* Progress Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Task Completion</span>
              <span>{stats.completedTasks}/{stats.totalTasks}</span>
            </div>
            <Progress
              value={stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-muted">
              <div className="text-2xl font-bold">{stats.todoTasks}</div>
              <div className="text-xs text-muted-foreground">To Do</div>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/10">
              <div className="text-2xl font-bold">{stats.inProgressTasks}</div>
              <div className="text-xs text-muted-foreground">In Progress</div>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10">
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
              <div className="text-xs text-muted-foreground">Done</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Projects */}
      {projects.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Folder className="w-5 h-5" />
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projects
                .filter((p) => p.status === 'active')
                .slice(0, 5)
                .map((project) => {
                  const projectTasks = tasks.filter(
                    (t) => t.projectRef === `projects/${project.id}`
                  );
                  const completed = projectTasks.filter((t) => t.status === 'done').length;
                  const total = projectTasks.length;
                  
                  return (
                    <div
                      key={project.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {project.milestones.length} milestones • {completed}/{total} tasks
                        </div>
                      </div>
                      <Badge variant={project.priority === 'high' ? 'destructive' : 'secondary'}>
                        {project.priority}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Task row component
interface TaskRowProps {
  task: {
    id: string;
    title: string;
    status: TaskStatus;
    priority: Priority;
    projectRef: string;
    dueDate: string | null;
  };
  projects: { id: string; name: string }[];
  onStatusChange: () => void;
  showDueDate?: boolean;
}

function TaskRow({ task, projects, onStatusChange, showDueDate }: TaskRowProps) {
  const project = projects.find((p) => `projects/${p.id}` === task.projectRef);
  
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg border hover:bg-accent/50 transition-colors">
      <button onClick={onStatusChange} className="flex-shrink-0">
        {statusIcons[task.status]}
      </button>
      <div className="flex-1 min-w-0">
        <p className={task.status === 'done' ? 'line-through text-muted-foreground' : ''}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className={priorityColors[task.priority]}>
            {task.priority}
          </Badge>
          {project && (
            <Badge variant="outline" className="text-xs">
              {project.name}
            </Badge>
          )}
          {showDueDate && task.dueDate && (
            <span className="text-xs text-red-500">
              Due {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
