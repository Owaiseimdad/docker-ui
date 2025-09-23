'use client';

import { useState, useEffect } from 'react';
import { indexedDBUtils } from '@/utils/indexDBUtils';
import { resetDockerInstance } from '@/lib/docker';
import { networkService } from '@/services/networkService';

export default function SettingsPage() {
  const [currentProvider, setCurrentProvider] = useState<string>('');
  const [newProvider, setNewProvider] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    const loadCurrentProvider = async () => {
      try {
        const provider = await indexedDBUtils.getDockerProvider();
        if (provider) {
          setCurrentProvider(provider);
          setNewProvider(provider);
        }
      } catch (error) {
        console.error('Failed to load current provider:', error);
      }
    };

    loadCurrentProvider();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvider.trim()) {
      setError('Please enter a Docker provider name');
      return;
    }

    if (newProvider.trim() === currentProvider) {
      setError('This is already your current provider');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const isValid = await networkService.getProviderDetails(newProvider.trim());

      if (isValid) {
        await indexedDBUtils.setDockerProvider(newProvider.trim());
        resetDockerInstance(); // Reset Docker instance to use new provider
        setCurrentProvider(newProvider.trim());
        setSuccess('Docker provider updated successfully!');
      } else {
        setError(`"${newProvider}" is not a valid Docker provider or is not running.`);
      }
    } catch (error) {
      setError('Failed to update Docker provider. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset your Docker provider settings? This will require you to set up the provider again on next app start.')) {
      try {
        await indexedDBUtils.clearProvider();
        resetDockerInstance();
        setCurrentProvider('');
        setNewProvider('');
        setSuccess('Provider settings reset successfully!');
      } catch (error) {
        setError('Failed to reset provider settings.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Docker Provider</h2>

            {currentProvider && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Current provider:</strong> {currentProvider}
                </p>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-2">
                  Docker Provider Name
                </label>
                <input
                  id="provider"
                  name="provider"
                  type="text"
                  required
                  value={newProvider}
                  onChange={(e) => setNewProvider(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., colima, docker-desktop, podman"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Common providers: colima, docker-desktop, podman, lima
                </p>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-md p-3">
                  {success}
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Validating...' : 'Save Provider'}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  Reset Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}