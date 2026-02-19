import { NextResponse } from 'next/server';
import {
  getAllTasks,
  getAllProjects,
  getAllFacts,
  getGraphData,
  getDashboardStats,
  getOverdueTasks,
  getTasksDueToday,
  ensureWorkspaceStructure,
} from '@/lib/data';

export async function GET() {
  try {
    await ensureWorkspaceStructure();
    
    const [tasks, projects, facts, graph, stats, overdue, dueToday] = await Promise.all([
      getAllTasks(),
      getAllProjects(),
      getAllFacts(),
      getGraphData(),
      getDashboardStats(),
      getOverdueTasks(),
      getTasksDueToday(),
    ]);
    
    return NextResponse.json({
      tasks,
      projects,
      facts,
      graph,
      stats,
      overdue,
      dueToday,
    });
  } catch (error) {
    console.error('Failed to load data:', error);
    return NextResponse.json(
      { error: 'Failed to load data', details: String(error) },
      { status: 500 }
    );
  }
}
