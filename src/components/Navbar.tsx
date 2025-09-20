'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDockerInfo } from '@/hooks/useDocker';

export default function Navbar() {
  const pathname = usePathname();
  const { dockerInfo, loading } = useDockerInfo();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-18">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.5 3c-1.930 0-3.5 1.570-3.5 3.5 0 .550.13 1.070.36 1.530L2.54 15.82c-.19.19-.19.51 0 .71l.71.71c.19.19.51.19.71 0l7.78-7.78c.46.23.98.36 1.53.36 1.930 0 3.5-1.570 3.5-3.5S15.43 3 13.5 3zm0 5.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                    <path d="M17.5 9c-1.930 0-3.5 1.570-3.5 3.5 0 .550.13 1.070.36 1.530L6.54 21.82c-.19.19-.19.51 0 .71l.71.71c.19.19.51.19.71 0l7.78-7.78c.46.23.98.36 1.53.36 1.930 0 3.5-1.570 3.5-3.5S19.43 9 17.5 9zm0 5.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                  </svg>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Docker UI
                </h1>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-2">
                <Link
                  href="/"
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive('/') && pathname === '/'
                      ? 'bg-blue-500 text-white shadow-lg transform -translate-y-0.5'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Containers
                </Link>
                <Link
                  href="/images"
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive('/images')
                      ? 'bg-blue-500 text-white shadow-lg transform -translate-y-0.5'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Images
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex items-center space-x-3 bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
              <div className={`h-3 w-3 rounded-full ${
                loading
                  ? 'bg-yellow-400 animate-pulse'
                  : dockerInfo.connected
                    ? 'bg-green-400 shadow-lg shadow-green-400/50'
                    : 'bg-red-400 shadow-lg shadow-red-400/50'
              }`} />
              <span className={`text-sm font-semibold ${
                loading
                  ? 'text-yellow-600'
                  : dockerInfo.connected
                    ? 'text-green-600'
                    : 'text-red-600'
              }`}>
                {loading ? 'Checking...' : dockerInfo.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}