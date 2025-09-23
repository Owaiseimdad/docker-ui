import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import Docker from 'dockerode';

const execAsync = promisify(exec);

async function getDockerSocketPath(provider: string): Promise<string> {
  switch (provider.toLowerCase()) {
    case 'colima':
      try {
        const { stdout } = await execAsync('docker context inspect colima --format "{{.Endpoints.docker.Host}}"');
        return stdout.trim().replace('unix://', '');
      } catch (error) {
        return `/Users/${process.env.USER}/.colima/default/docker.sock`;
      }

    case 'docker-desktop':
    case 'docker':
      return '/var/run/docker.sock';

    case 'podman':
      try {
        const { stdout } = await execAsync('podman machine inspect --format "{{.ConnectionInfo.PodmanSocket.Path}}"');
        return stdout.trim();
      } catch (error) {
        return `/Users/${process.env.USER}/.local/share/containers/podman/machine/podman-machine-default/podman.sock`;
      }

    case 'lima':
      return `/Users/${process.env.USER}/.lima/default/sock/docker.sock`;

    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

async function validateDockerProvider(provider: string): Promise<boolean> {
  try {
    const socketPath = await getDockerSocketPath(provider);
    const docker = new Docker({ socketPath });

    await docker.info();
    return true;
  } catch (error) {
    console.error(`Provider ${provider} validation failed:`, error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json();
    console.log("BACKEND: ", provider);

    if (!provider) {
      return NextResponse.json(
        { valid: false, error: 'Provider name is required' },
        { status: 400 }
      );
    }

    const isValid = await validateDockerProvider(provider);

    return NextResponse.json({
      valid: isValid,
      provider
    });

  } catch (error) {
    console.error('Provider validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}