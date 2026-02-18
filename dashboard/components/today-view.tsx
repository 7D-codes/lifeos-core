'use client';

import { useDashboardStore } from '@/store/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Calendar, CheckCircle2, Clock, Flame, Pin } from 'lucide-react';
import { format } from 'date-fns';

export function TodayView() {
  const { tasks, projects, updateTaskStatus, getStats } = useDashboardStore();
  
  const todayTasks = tasks.filter((t) => t.status !== 'done').slice(0, 5);
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && t.dueDate < new Date() && t.status !== 'done'
  );
  const stats = getStats();
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Today</h1>
          <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM do')}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Focus Hours</div>
            <div className="text-2xl font-bold">{stats.focusHours}h</div>
          </div>
        </div>
      </div>
      
      {/* Focus Tasks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Today's Focus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <p className="text-muted-foreground">No tasks for today. Add some!</p>
            ) : (
              todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={task.status === 'done'}
                    onCheckedChange={(checked) =>
                      updateTaskStatus(task.id, checked ? 'done' : 'todo')
                    }
                  />
                  <div className="flex-1">
                    <p className={task.status === 'done' ? 'line-through text-muted-foreground' : ''}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={task.priority === 'urgent' ? 'destructive' : 'secondary'}>
                        {task.priority}
                      </Badge>
                      {task.projectId && (
                        <Badge variant="outline">
                          {projects.find((p) => p.id === task.projectId)?.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
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
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {overdueTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-2 rounded bg-red-500/10"
                  >
                    <Checkbox
                      checked={task.status === 'done'}
                      onCheckedChange={(checked) =>
                        updateTaskStatus(task.id, checked ? 'done' : 'todo')
                      }
                    />
                    <span className="flex-1">{task.title}</span>
                    <Badge variant="destructive">
                      {task.dueDate && format(task.dueDate, 'MMM d')}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      
      {/* Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Weekly Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Tasks</span>
              <span>{stats.completedTasks}/{stats.totalTasks}</span>
            </div>
            <Progress
              value={stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}
            />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Focus Time</span>
              <span>{stats.focusHours}h / 40h</span>
            </div>
            <Progress value={(stats.focusHours / 40) * 100} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
