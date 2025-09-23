interface Container {
  Id: string;
  Names: string[];
  State: string;
  Status: string;
  Image: string;
  Ports?: Array<{
    IP?: string;
    PrivatePort: number;
    PublicPort?: number;
    Type: string;
  }>;
}

interface ContainerResponse {
  containers: Container[];
  runningCount: number;
  error?: string;
}

interface DockerImage {
  Id: string;
  RepoTags?: string[];
  Size: number;
  Created: number;
}

interface ImagesResponse {
  images: DockerImage[];
  totalImages: number;
  error?: string;
}

interface DockerNetwork {
  Id: string;
  Name: string;
  Driver: string;
  Scope: string;
  Created?: string;
  Containers?: { [key: string]: any };
}

interface NetworksResponse {
  networks: DockerNetwork[];
  totalNetworks: number;
  error?: string;
}

interface DockerInfo {
  connected: boolean;
  error?: string;
}

class NetworkService {
  private baseUrl = '/api';

  async getContainers(): Promise<ContainerResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/containers`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching containers:', error);
      return {
        containers: [],
        runningCount: 0,
        error: 'Failed to fetch containers'
      };
    }
  }

  async getImages(): Promise<ImagesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/images`);
      const data = await response.json();
      return {
        images: data.info || [],
        totalImages: data.info?.length || 0,
        error: data.error
      };
    } catch (error) {
      console.error('Error fetching images:', error);
      return {
        images: [],
        totalImages: 0,
        error: 'Failed to fetch images'
      };
    }
  }

  async getNetworks(): Promise<NetworksResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/networks`);
      const data = await response.json();
      return {
        networks: data.networks || [],
        totalNetworks: data.networks?.length || 0,
        error: data.error
      };
    } catch (error) {
      console.error('Error fetching networks:', error);
      return {
        networks: [],
        totalNetworks: 0,
        error: 'Failed to fetch networks'
      };
    }
  }

  async removeImage(imageId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/images/${imageId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error removing image:', error);
      return {
        success: false,
        error: 'Failed to remove image'
      };
    }
  }

  async getDockerInfo(): Promise<DockerInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/docker-info`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Docker info:', error);
      return {
        connected: false,
        error: 'Failed to connect to Docker'
      };
    }
  }

  getContainerLogs(containerId: string): EventSource {
    return new EventSource(`${this.baseUrl}/logs/${containerId}`);
  }

  async containerAction(containerId: string, action: 'start' | 'stop' | 'restart'): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/containers/${containerId}/${action}`, {
        method: 'POST'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error ${action}ing container:`, error);
      return {
        success: false,
        error: `Failed to ${action} container`
      };
    }
  }

  async getProviderDetails(providerName: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/validate-provider`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ provider: providerName }),
      });

      const result = await response.json();
      return result.valid;
    } catch (error) {
      console.error("Provider validation error:", error);
      return false;
    }
  }
}

export const networkService = new NetworkService();
export type {
  Container,
  ContainerResponse,
  DockerImage,
  ImagesResponse,
  DockerNetwork,
  NetworksResponse,
  DockerInfo
};