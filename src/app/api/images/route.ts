import { NextResponse } from 'next/server';
import { docker, testConnection } from '@/lib/docker';

export async function GET() {
  try {
    const connected = await testConnection();
    if (connected) {
      const info = await docker.listImages();
      return NextResponse.json({
        info
      });
    } else {
      return NextResponse.json({
        connected: false,
        error: 'Cannot get the images'
      });
    }
  } catch (error) {
    console.error('Error fetching Docker images:', error);
    return NextResponse.json({
      connected: false,
      error: 'Failed to fetch Docker images'
    }, { status: 500 });
  }
}