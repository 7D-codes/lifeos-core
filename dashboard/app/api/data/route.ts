import { NextResponse } from 'next/server';
import { getAllTasks, getProjects } from '@/lib/parser';

export async function GET() {
  try {
    const tasks = getAllTasks();
    const projects = getProjects();
    
    return NextResponse.json({ tasks, projects });
  } catch (error) {
    console.error('Failed to load data:', error);
    return NextResponse.json(
      { error: 'Failed to load data' },
      { status: 500 }
    );
  }
}
