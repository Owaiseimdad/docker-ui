'use client';
import { useState } from 'react';
import StatsCard from '@/components/StatsCard';
import ImageCard from '@/components/ImageCard';
import ActionButton from '@/components/ActionButton';
import { useImages, useImageActions } from '@/hooks/useDocker';

export default function ImagesPage() {
  const { images, totalImages, loading, error, refresh } = useImages();
  const { removeImage, loading: actionLoading } = useImageActions();
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [removingImage, setRemovingImage] = useState<string | null>(null);

  const handleImageRemove = async (imageId: string) => {
    setRemovingImage(imageId);
    try {
      const result = await removeImage(imageId);
      if (result.success) {
        refresh(); // Refresh the images list
      } else {
        alert(result.error || 'Failed to remove image');
      }
    } finally {
      setRemovingImage(null);
    }
  };

  const handleSelectAll = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(images.map(img => img.Id)));
    }
  };

  const toggleImageSelection = (imageId: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const handleBulkRemove = async () => {
    if (selectedImages.size === 0) return;

    for (const imageId of selectedImages) {
      await handleImageRemove(imageId);
    }
    setSelectedImages(new Set());
  };

  const totalSize = images.reduce((acc, img) => acc + img.Size, 0);
  const formatTotalSize = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded-lg w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-white rounded-xl shadow-sm"></div>
                ))}
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-white rounded-xl shadow-sm"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
                  <h2 className="text-2xl font-bold text-red-900 mb-1">Error Loading Images</h2>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
              <ActionButton variant="danger" onClick={refresh}>
                Retry
              </ActionButton>
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
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Docker Images</h1>
                <p className="text-gray-600">Manage your Docker images and repositories</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {images.length > 0 && (
                  <>
                    <ActionButton
                      variant="secondary"
                      onClick={handleSelectAll}
                    >
                      {selectedImages.size === images.length ? 'Deselect All' : 'Select All'}
                    </ActionButton>
                    {selectedImages.size > 0 && (
                      <ActionButton
                        variant="danger"
                        onClick={handleBulkRemove}
                      >
                        Remove Selected ({selectedImages.size})
                      </ActionButton>
                    )}
                  </>
                )}
                <ActionButton
                  variant="primary"
                  onClick={refresh}
                >
                  Refresh
                </ActionButton>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatsCard
                title="Total Images"
                value={images.length}
                bgColor="from-purple-500 to-purple-600"
                icon={
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                }
              />
              <StatsCard
                title="Total Size"
                value={formatTotalSize(totalSize)}
                bgColor="from-indigo-500 to-indigo-600"
                icon={
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                }
              />
              <StatsCard
                title="Selected"
                value={selectedImages.size}
                bgColor="from-teal-500 to-teal-600"
                icon={
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                }
              />
            </div>

            {images.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No images available</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Pull your first Docker image to see it appear here. Try running:
                </p>
                <code className="bg-gray-900 text-green-400 px-6 py-3 rounded-xl font-mono text-sm">
                  docker pull nginx
                </code>
              </div>
            ) : (
              <div className="grid gap-6">
                {images.map((image) => (
                  <ImageCard
                    key={image.Id}
                    image={image}
                    isSelected={selectedImages.has(image.Id)}
                    onToggleSelect={toggleImageSelection}
                    onRemove={handleImageRemove}
                    isRemoving={removingImage === image.Id}
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