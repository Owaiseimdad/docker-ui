import Docker from 'dockerode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function getStoredProvider(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    const { indexedDBUtils } = await import('@/utils/indexDBUtils');
    return await indexedDBUtils.getDockerProvider();
  } catch (error) {
    console.error('Failed to get stored provider:', error);
    return null;
  }
}

async function getDockerSocketPath(provider?: string): Promise<string> {
  const providerName = provider || await getStoredProvider() || 'colima';

  switch (providerName.toLowerCase()) {
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
      console.warn(`Unknown provider: ${providerName}, falling back to colima`);
      return `/Users/${process.env.USER}/.colima/default/docker.sock`;
  }
}

// Initialize Docker client with lazy socket path resolution
let dockerInstance: Docker | null = null;
let currentProvider: string | null = null;

async function getDockerInstance(): Promise<Docker> {
  const provider = await getStoredProvider();

  if (!dockerInstance || currentProvider !== provider) {
    const socketPath = await getDockerSocketPath(provider || undefined);
    dockerInstance = new Docker({ socketPath });
    currentProvider = provider;
  }
  return dockerInstance;
}

export function resetDockerInstance(): void {
  dockerInstance = null;
  currentProvider = null;
}

export const docker = {
    // list of containers
  async listContainers(options?: Docker.ContainerListOptions) {
    const instance = await getDockerInstance();
    return instance.listContainers(options);
  },

  async listImages(options?: Docker.ListImagesOptions){
     const instance = await getDockerInstance();
     return instance.listImages(options);
  },

  // info
  async info() {
    const instance = await getDockerInstance();
    return instance.info();
  },

  // get the container info from id
  getContainer(containerId: string) {
    return {
      async logs(options?: Docker.ContainerLogsOptions) {
        const instance = await getDockerInstance();
        const container = instance.getContainer(containerId);
        const finalOptions = { stdout: true, stderr: true, follow: false, ...options };

        if (finalOptions.follow) {
          return container.logs({ ...finalOptions, follow: true });
        } else {
          return container.logs({ ...finalOptions, follow: false });
        }
      }
    };
  },

  // getting docker instances
  async getDockerInstance() {
    return await getDockerInstance();
  }
};

export async function testConnection() {
  try {
    const info = await docker.info();
    console.log('Docker connected:', info.ServerVersion);
    return true;
  } catch (error) {
    console.error('Docker connection failed:', error);
    return false;
  }
}

// CLI fallback for listing containers
export async function listContainers() {
  try {
    const containers = await docker.listContainers({ all: false });
    return { containers, runningCount: containers.length };
  } catch (error) {
    console.error('Dockerode listContainers failed:', error);
    const { stdout } = await execAsync('docker ps --format "{{.ID}}|{{.Names}}|{{.State}}"');
    const containers = stdout
      .trim()
      .split('\n')
      .filter(line => line)
      .map(line => {
        const [Id, Names, State] = line.split('|');
        return { Id, Names: [Names], State };
      });
    return { containers, runningCount: containers.length };
  }
}

// CLI for listing all the images
export async function listImages() {
  try {
    const images = await docker.listImages({ all: false });
    return images;
  } catch (error) {
    console.error('Dockerode listImages failed:', error);
    const { stdout } = await execAsync('docker images --format "{{.Repository}}|{{.Tag}}|{{.ID}}|{{.CreatedSince}}|{{.Size}}"');
    const images = stdout
      .trim()
      .split('\n')
      .filter(line => line)
      .map(line => {
        const [repo, tag, id, created, size] = line.split('|');
        return { repo, tag, id, created, size};
      });
    return images;
  }
}