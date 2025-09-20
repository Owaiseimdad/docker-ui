import { NextResponse } from 'next/server';
import { docker, testConnection } from '@/lib/docker';

export async function GET() {
  try {
    const connected = await testConnection();
    if (connected) {
      const info = await docker.info();
      return NextResponse.json({
        connected: true,
        serverVersion: info.ServerVersion,
        containers: info.Containers,
        containersRunning: info.ContainersRunning,
        containersPaused: info.ContainersPaused,
        containersStopped: info.ContainersStopped,
        images: info.Images
      });
    } else {
      return NextResponse.json({
        connected: false,
        error: 'Cannot connect to Docker daemon'
      });
    }
  } catch (error) {
    console.error('Error fetching Docker info:', error);
    return NextResponse.json({
      connected: false,
      error: 'Failed to fetch Docker information'
    }, { status: 500 });
  }
}