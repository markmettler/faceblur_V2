import { X } from 'lucide-react';
import { useMediaDevices } from '../hooks/useMediaDevices';
import { useRecordingStore } from '../store/useRecordingStore';

interface DeviceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeviceSettingsModal({ isOpen, onClose }: DeviceSettingsModalProps) {
  const { cameras, microphones, error } = useMediaDevices();
  const {
    selectedCamera,
    selectedMicrophone,
    setSelectedCamera,
    setSelectedMicrophone,
    mode,
  } = useRecordingStore();

  const currentCamera = selectedCamera || (cameras.length > 0 ? cameras[0].deviceId : '');
  const currentMicrophone = selectedMicrophone || (microphones.length > 0 ? microphones[0].deviceId : '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Apparaatinstellingen</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded p-1"
            aria-label="Sluiten"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded">
              {error}
            </div>
          )}

          {mode === 'video' && (
            <div>
              <label className="block text-white font-medium mb-3">
                Camera
              </label>
              <select
                value={currentCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {cameras.length === 0 && (
                  <option value="">Geen camera's gevonden</option>
                )}
                {cameras.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-white font-medium mb-3">
              Microfoon
            </label>
            <select
              value={currentMicrophone}
              onChange={(e) => setSelectedMicrophone(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {microphones.length === 0 && (
                <option value="">Geen microfoons gevonden</option>
              )}
              {microphones.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microfoon ${device.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Opslaan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
