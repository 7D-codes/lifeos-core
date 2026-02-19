import { NextRequest, NextResponse } from 'next/server';
import { updateTaskStatus, assignTask, updateTaskPriority } from '@/lib/data';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskId, status, priority } = body;
    
    if (status) {
      const updated = await updateTaskStatus(taskId, status);
      if (!updated) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
      return NextResponse.json(updated);
    }
    
    if (priority) {
      const updated = await updateTaskPriority(taskId, priority);
      if (!updated) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
      return NextResponse.json(updated);
    }
    
    return NextResponse.json({ error: 'No valid update provided' }, { status: 400 });
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}
