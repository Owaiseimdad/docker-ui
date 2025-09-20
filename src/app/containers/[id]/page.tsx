'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useContainerLogs, useContainers } from '@/hooks/useDocker';
import Navbar from '@/components/Navbar';

export default function ContainerLogsPage() {
  const params = useParams();
  const router = useRouter();
  const containerId = params.id as string;
  const { logs, loading, error, clearLogs } = useContainerLogs(containerId);
  const { containers } = useContainers();
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState('');
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Find container info
  const container = containers.find(c => c.Id === containerId || c.Id.startsWith(containerId));

  // Auto scroll to bottom
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = filter
    ? logs.filter(log => log.toLowerCase().includes(filter.toLowerCase()))
    : logs;

  const formatLogLine = (logLine: string) => {
    // Remove Docker log prefix and clean up the line
    const cleaned = logLine.replace(/^\d+:\d+:\d+\.\d+Z\s*/, '');
    return cleaned || logLine;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={() => router.back()}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Containers
              </button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {container?.Names[0]?.replace(/^\//, '') || 'Container Logs'}
                </h1>
                <p className="text-gray-600">
                  <span className="font-medium">ID:</span> <span className="font-mono">{containerId.slice(0, 12)}</span>
                  {container?.State && (
                    <span className={`ml-4 inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      container.State === 'running'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {container.State}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={autoScroll}
                      onChange={(e) => setAutoScroll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700">Auto-scroll</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Filter logs..."
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600 font-medium">
                    {filteredLogs.length} lines
                  </div>
                  <button
                    onClick={clearLogs}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Logs Display */}
          <div className="bg-gradient-to-r from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-4 border-b border-gray-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-100 flex items-center">
                  Live Container Logs
                </h3>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
                  <span className="text-sm text-gray-300">
                    {loading ? 'Loading...' : 'Connected'}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-[600px] overflow-y-auto font-mono text-sm bg-black">
              {loading && logs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
                    <p className="text-lg font-medium">Connecting to container logs...</p>
                    <p className="text-sm opacity-75">This may take a moment</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full text-red-400">
                  <div className="text-center bg-red-900/20 rounded-lg p-8">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium mb-2">Error loading logs</p>
                    <p className="text-sm opacity-75">{error}</p>
                  </div>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium mb-2">
                      {logs.length === 0 ? 'No logs available' : 'No logs match your filter'}
                    </p>
                    <p className="text-sm opacity-75">
                      {logs.length === 0 ? 'Container might not be producing any output' : `Try adjusting your filter: "${filter}"`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  {filteredLogs.map((log, index) => (
                    <div
                      key={index}
                      className="text-green-400 whitespace-pre-wrap break-words leading-relaxed hover:bg-gray-900/50 px-2 py-1 rounded transition-colors"
                    >
                      <span className="text-gray-500 select-none mr-2">
                        {String(index + 1).padStart(4, ' ')}
                      </span>
                      {formatLogLine(log)}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Container Info */}
          {container && (
            <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                Container Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Name</h4>
                  <p className="text-blue-800 font-mono">{container.Names[0]?.replace(/^\//, '')}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Status</h4>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    container.State === 'running'
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-gray-100 text-gray-800 border border-gray-300'
                  }`}>
                    {container.State}
                  </span>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">Container ID</h4>
                  <p className="text-purple-800 font-mono text-sm break-all">{container.Id}</p>
                </div>
                {container.Image && (
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <h4 className="font-semibold text-orange-900 mb-2">Image</h4>
                    <p className="text-orange-800 font-mono text-sm">{container.Image}</p>
                  </div>
                )}
                {container.Status && (
                  <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                    <h4 className="font-semibold text-indigo-900 mb-2">Runtime Status</h4>
                    <p className="text-indigo-800 text-sm">{container.Status}</p>
                  </div>
                )}
                {container.Ports && container.Ports.length > 0 && (
                  <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                    <h4 className="font-semibold text-cyan-900 mb-2">Ports</h4>
                    <div className="space-y-1">
                      {container.Ports.map((port, idx) => (
                        <p key={idx} className="text-cyan-800 text-sm font-mono">
                          {port.PublicPort ? `${port.PublicPort}:` : ''}{port.PrivatePort}/{port.Type}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}