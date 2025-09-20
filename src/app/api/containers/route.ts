import { NextResponse } from 'next/server';
import { docker } from '@/lib/docker';

export async function GET() {
  try {
    const containers = await docker.listContainers({ all: false });
    const runningCount = containers.length;
    return NextResponse.json({ containers, runningCount });
  } catch (error) {
    console.error('Error fetching containers:', error);
    return NextResponse.json({ error: 'Failed to fetch containers' }, { status: 500 });
  }
}