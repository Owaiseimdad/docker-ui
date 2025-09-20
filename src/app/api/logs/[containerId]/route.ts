import { NextRequest, NextResponse } from 'next/server';
import { docker } from '@/lib/docker';

export async function GET(
  req: NextRequest,
  { params }: { params: { containerId: string } }
) {
  const containerId = params.containerId;

  try {
    const container = docker.getContainer(containerId);
    const stream = await container.logs({
      follow: true,
      stdout: true,
      stderr: true,
      timestamps: true,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: Buffer) => {
          // Docker log format: 8 bytes header + log data
          // First byte indicates stdout (1) or stderr (2)
          let logData = chunk.toString();

          // Remove Docker's 8-byte header if present
          if (chunk.length > 8 && chunk[0] <= 2) {
            logData = chunk.slice(8).toString();
          }

          // Clean up the log line
          const cleanedLog = logData.trim();
          if (cleanedLog) {
            const sseData = `data: ${cleanedLog}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          }
        });

        stream.on('end', () => {
          controller.close();
        });

        stream.on('error', (error) => {
          console.error('Stream error:', error);
          controller.close();
        });
      },

      cancel() {
        stream.destroy();
      },
    });

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });

  } catch (error) {
    console.error('Error streaming logs:', error);
    return NextResponse.json({
      error: 'Failed to stream logs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}