import ActionButton from './ActionButton';

interface ImageProps {
  Id: string;
  RepoTags?: string[];
  Size: number;
  Created: number;
}

interface ImageCardProps {
  image: ImageProps;
  isSelected: boolean;
  onToggleSelect: (imageId: string) => void;
  onRemove: (imageId: string) => void;
  isRemoving: boolean;
}

export default function ImageCard({
  image,
  isSelected,
  onToggleSelect,
  onRemove,
  isRemoving
}: ImageCardProps) {
  const formatSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    const gb = mb / 1024;
    return gb > 1 ? `${gb.toFixed(1)} GB` : `${mb.toFixed(1)} MB`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const repoTag = image.RepoTags?.[0] || 'none:none';
  const [repository, tag] = repoTag.split(':');

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 transform hover:-translate-y-1 ${
        isSelected ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200'
      }`}
    >
      <div className="p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(image.Id)}
              className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">
                  {repository}
                </h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  {tag}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium">ID:</span>{' '}
                  <span className="font-mono">{image.Id.slice(7, 19)}</span>
                </p>
                <p>
                  <span className="font-medium">Size:</span> {formatSize(image.Size)}
                </p>
                <p>
                  <span className="font-medium">Created:</span> {formatDate(image.Created)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-6">
            <ActionButton
              variant="danger"
              onClick={() => onRemove(image.Id)}
              disabled={isRemoving}
            >
              {isRemoving ? 'Removing...' : 'Remove'}
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}