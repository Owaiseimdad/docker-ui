"use client";

import { useState } from "react";
import { indexedDBUtils } from "@/utils/indexDBUtils";
import { networkService } from "@/services/networkService";

interface ProviderSetupProps {
  onProviderSet: (provider: string) => void;
}

export default function ProviderSetup({ onProviderSet }: ProviderSetupProps) {
  const [provider, setProvider] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider.trim()) {
      setError("Please enter a Docker provider name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log(provider.trim())
      const isValid = await networkService.getProviderDetails(provider.trim());

      if (isValid) {
        await indexedDBUtils.setDockerProvider(provider.trim());
        onProviderSet(provider.trim());
      } else {
        setError(
          `"${provider}" is not a valid Docker provider or is not running. Please check your Docker installation.`
        );
      }
    } catch (error) {
      setError("Failed to validate Docker provider. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Setup Docker Provider
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your Docker containerization provider name
            <br />
            (e.g., colima, docker-desktop)
          </p>
        </div>
        <form className="mt-8 space-y-6 items-center justify-center" onSubmit={handleSubmit}>

          {/* Input Button */}
          <input
            id="provider"
            name="provider"
            type="text"
            required
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="fixed-input w-100"
            placeholder="Enter Docker provider (e.g., colima)"
            disabled={loading}
          />

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button type="submit" disabled={loading} className="btn">
            {loading ? "Validating..." : "Set Provider"}
          </button>
        </form>
      </div>
    </div>
  );
}
