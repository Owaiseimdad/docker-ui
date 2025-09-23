'use client';
import { useState } from 'react';
import { useContainers, useContainerActions } from '@/hooks/useDocker';
import StatsCard from '@/components/StatsCard';
import ContainerCard from '@/components/ContainerCard';
import HomebodySkeleton from '@/components/HomeBodySkeleton';

export default function Home() {
  const { containers, runningCount, loading, error, refresh } = useContainers();
  const { performAction, loading: actionLoading } = useContainerActions();
  const [selectedContainers, setSelectedContainers] = useState<Set<string>>(new Set());
  const [actioningContainer, setActioningContainer] = useState<string | null>(null);

  const handleContainerAction = async (containerId: string, action: 'start' | 'stop' | 'restart') => {
    setActioningContainer(containerId);
    try {
      const result = await performAction(containerId, action);
      if (result.success) {
        refresh();
      } else {
        alert(result.error || `Failed to ${action} container`);
      }
    } finally {
      setActioningContainer(null);
    }
  };

  const handleBulkRestart = async () => {
    if (selectedContainers.size === 0) return;

    for (const containerId of selectedContainers) {
      await handleContainerAction(containerId, 'restart');
    }
    setSelectedContainers(new Set());
  };

  const handleSelectAll = () => {
    if (selectedContainers.size === containers.length) {
      setSelectedContainers(new Set());
    } else {
      setSelectedContainers(new Set(containers.map(c => c.Id)));
    }
  };

  const toggleContainer = (containerId: string) => {
    const newSelected = new Set(selectedContainers);
    if (newSelected.has(containerId)) {
      newSelected.delete(containerId);
    } else {
      newSelected.add(containerId);
    }
    setSelectedContainers(newSelected);
  };

  if (loading) {
    return (
      <>
        <HomebodySkeleton />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-900 mb-1">Connection Error</h2>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
              <p className="text-red-600 mb-6">
                Ensure Docker/Colima is running and accessible.
              </p>
              <button
                onClick={refresh}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Docker Containers</h1>
                <p className="text-gray-600">Manage your Docker containers with ease</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {containers.length > 0 && (
                  <>
                    <button
                      onClick={handleSelectAll}
                      className="px-4 py-2 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      {selectedContainers.size === containers.length ? 'Deselect All' : 'Select All'}
                    </button>
                    {selectedContainers.size > 0 && (
                      <button
                        onClick={handleBulkRestart}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Restart Selected ({selectedContainers.size})
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={refresh}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Refresh
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatsCard
                title="Running Containers"
                value={runningCount}
                bgColor="from-blue-500 to-blue-600"
                icon={
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                }
              />
              <StatsCard
                title="Total Containers"
                value={containers.length}
                bgColor="from-green-500 to-green-600"
                icon={
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                }
              />
              <StatsCard
                title="Selected"
                value={selectedContainers.size}
                bgColor="from-purple-500 to-purple-600"
                icon={
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                }
              />
            </div>

            {containers.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No containers running</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Start your first container to see it appear here. Try running:
                </p>
                <code className="bg-gray-900 text-green-400 px-6 py-3 rounded-xl font-mono text-sm">
                  docker run -d nginx
                </code>
              </div>
            ) : (
              <div className="grid gap-6">
                {containers.map((container) => (
                  <ContainerCard
                    key={container.Id}
                    container={container}
                    isSelected={selectedContainers.has(container.Id)}
                    isActioning={actioningContainer === container.Id}
                    onToggleSelect={toggleContainer}
                    onAction={handleContainerAction}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}