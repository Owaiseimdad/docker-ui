'use client';
import { useState, useEffect, useCallback } from 'react';
import { networkService, Container, DockerInfo, DockerImage, DockerNetwork } from '@/services/networkService';

export function useContainers() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [runningCount, setRunningCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContainers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await networkService.getContainers();
      if (data.error) {
        setError(data.error);
        setContainers([]);
        setRunningCount(0);
      } else {
        setContainers(data.containers);
        setRunningCount(data.runningCount);
        setError(null);
      }
    } catch (err) {
      setError('Failed to fetch containers');
      console.error('Error in useContainers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContainers();
  }, [fetchContainers]);

  const refreshContainers = useCallback(() => {
    fetchContainers();
  }, [fetchContainers]);

  return {
    containers,
    runningCount,
    loading,
    error,
    refresh: refreshContainers
  };
}

export function useDockerInfo() {
  const [dockerInfo, setDockerInfo] = useState<DockerInfo>({ connected: false });
  const [loading, setLoading] = useState(true);

  const fetchDockerInfo = useCallback(async () => {
    setLoading(true);
    try {
      const info = await networkService.getDockerInfo();
      setDockerInfo(info);
    } catch (err) {
      setDockerInfo({ connected: false, error: 'Failed to check Docker connection' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDockerInfo();
  }, [fetchDockerInfo]);

  return {
    dockerInfo,
    loading,
    refresh: fetchDockerInfo
  };
}

export function useContainerLogs(containerId: string | null) {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerId) return;

    setLoading(true);
    setError(null);
    setLogs([]);

    const eventSource = networkService.getContainerLogs(containerId);

    eventSource.onmessage = (event) => {
      setLogs(prev => [...prev, event.data]);
      setLoading(false);
    };

    eventSource.onerror = () => {
      setError('Failed to fetch logs');
      setLoading(false);
    };

    return () => {
      eventSource.close();
    };
  }, [containerId]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    logs,
    loading,
    error,
    clearLogs
  };
}

export function useContainerActions() {
  const [loading, setLoading] = useState(false);

  const performAction = useCallback(async (containerId: string, action: 'start' | 'stop' | 'restart') => {
    setLoading(true);
    try {
      const result = await networkService.containerAction(containerId, action);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    performAction,
    loading
  };
}

export function useImages() {
  const [images, setImages] = useState<DockerImage[]>([]);
  const [totalImages, setTotalImages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await networkService.getImages();
      if (data.error) {
        setError(data.error);
        setImages([]);
        setTotalImages(0);
      } else {
        setImages(data.images);
        setTotalImages(data.totalImages);
        setError(null);
      }
    } catch (err) {
      setError('Failed to fetch images');
      console.error('Error in useImages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const refreshImages = useCallback(() => {
    fetchImages();
  }, [fetchImages]);

  return {
    images,
    totalImages,
    loading,
    error,
    refresh: refreshImages
  };
}

export function useNetworks() {
  const [networks, setNetworks] = useState<DockerNetwork[]>([]);
  const [totalNetworks, setTotalNetworks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNetworks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await networkService.getNetworks();
      if (data.error) {
        setError(data.error);
        setNetworks([]);
        setTotalNetworks(0);
      } else {
        setNetworks(data.networks);
        setTotalNetworks(data.totalNetworks);
        setError(null);
      }
    } catch (err) {
      setError('Failed to fetch networks');
      console.error('Error in useNetworks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNetworks();
  }, [fetchNetworks]);

  const refreshNetworks = useCallback(() => {
    fetchNetworks();
  }, [fetchNetworks]);

  return {
    networks,
    totalNetworks,
    loading,
    error,
    refresh: refreshNetworks
  };
}

export function useImageActions() {
  const [loading, setLoading] = useState(false);

  const removeImage = useCallback(async (imageId: string) => {
    setLoading(true);
    try {
      const result = await networkService.removeImage(imageId);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    removeImage,
    loading
  };
}