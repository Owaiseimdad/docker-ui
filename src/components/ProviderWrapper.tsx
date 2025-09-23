'use client';

import { useEffect, useState } from 'react';
import ProviderSetup from '@/components/ProviderSetup';
import { indexedDBUtils } from '@/utils/indexDBUtils';
import Loader from './Loader';

interface ProviderWrapperProps {
  children: React.ReactNode;
}

export default function ProviderWrapper({ children }: ProviderWrapperProps) {
  const [provider, setProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProvider = async () => {
      try {
        const storedProvider = await indexedDBUtils.getDockerProvider();
        setProvider(storedProvider);
      } catch (error) {
        console.error('Failed to check provider:', error);
      } finally {
        setLoading(false);
      }
    };

    checkProvider();
  }, []);

  const handleProviderSet = (newProvider: string) => {
    setProvider(newProvider);
  };

  if (loading) {
    return <Loader />;
  }

  if (!provider) {
    return <ProviderSetup onProviderSet={handleProviderSet} />;
  }

  return <>{children}</>;
}