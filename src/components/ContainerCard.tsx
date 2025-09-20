import Link from 'next/link';
import { Container } from '@/services/networkService';
import ActionButton from './ActionButton';

interface ContainerCardProps {
  container: Container;
  isSelected: boolean;
  isActioning: boolean;
  onToggleSelect: (containerId: string) => void;
  onAction: (containerId: string, action: 'start' | 'stop' | 'restart') => void;
}

export default function ContainerCard({
  container,
  isSelected,
  isActioning,
  onToggleSelect,
  onAction
}: ContainerCardProps) {
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
              onChange={() => onToggleSelect(container.Id)}
              className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <Link href={`/containers/${container.Id}`} className="flex-1">
              <div className="cursor-pointer">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {container.Names[0]?.replace(/^\//, '') || 'Unnamed Container'}
                  </h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    container.State === 'running'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : container.State === 'paused'
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {container.State}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">ID:</span> <span className="font-mono">{container.Id.slice(0, 12)}</span></p>
                  {container.Image && (
                    <p><span className="font-medium">Image:</span> {container.Image}</p>
                  )}
                  {container.Status && (
                    <p><span className="font-medium">Status:</span> {container.Status}</p>
                  )}
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-2 ml-6">
            {container.State !== 'running' && (
              <ActionButton
                variant="success"
                onClick={() => onAction(container.Id, 'start')}
                disabled={isActioning}
              >
                {isActioning ? 'Starting...' : 'Start'}
              </ActionButton>
            )}
            {container.State === 'running' && (
              <ActionButton
                variant="danger"
                onClick={() => onAction(container.Id, 'stop')}
                disabled={isActioning}
              >
                {isActioning ? 'Stopping...' : 'Stop'}
              </ActionButton>
            )}
            <ActionButton
              variant="warning"
              onClick={() => onAction(container.Id, 'restart')}
              disabled={isActioning}
            >
              {isActioning ? 'Restarting...' : 'Restart'}
            </ActionButton>
            <Link href={`/containers/${container.Id}`}>
              <ActionButton variant="primary" onClick={() => {}}>
                Logs
              </ActionButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}