import { NextRequest, NextResponse } from 'next/server';
import { docker } from '@/lib/docker';

export async function POST(
  req: NextRequest,
  { params }: { params: { containerId: string; action: string } }
) {
  const { containerId, action } = params;

  if (!['start', 'stop', 'restart'].includes(action)) {
    return NextResponse.json(
      { success: false, error: 'Invalid action. Must be start, stop, or restart' },
      { status: 400 }
    );
  }

  try {
    const instance = await (docker as any).getDockerInstance();
    const container = instance.getContainer(containerId);

    switch (action) {
      case 'start':
        await container.start();
        break;
      case 'stop':
        await container.stop();
        break;
      case 'restart':
        await container.restart();
        break;
    }

    return NextResponse.json({
      success: true,
      message: `Container ${action}ed successfully`
    });

  } catch (error) {
    console.error(`Error ${action}ing container:`, error);
    return NextResponse.json({
      success: false,
      error: `Failed to ${action} container: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}