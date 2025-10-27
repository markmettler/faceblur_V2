import { X, Loader } from 'lucide-react';
import { TrackedFace } from '../utils/faceDetection';

interface FaceAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  faces: TrackedFace[];
  selectedFaceIds: Set<number>;
  onToggleFace: (faceId: number) => void;
  isAnalyzing: boolean;
  analysisProgress: number;
  onStartAnalysis: () => void;
  onApplyBlur: () => void;
}

export function FaceAnalysisModal({
  isOpen,
  onClose,
  faces,
  selectedFaceIds,
  onToggleFace,
  isAnalyzing,
  analysisProgress,
  onStartAnalysis,
  onApplyBlur,
}: FaceAnalysisModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-2xl font-bold text-white">Gezichtsanalyse</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded p-1"
            aria-label="Sluiten"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {isAnalyzing ? (
            <div className="text-center py-12">
              <Loader className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-white text-lg mb-2">Video analyseren...</p>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              <p className="text-gray-400">{Math.round(analysisProgress)}%</p>
            </div>
          ) : faces.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white text-lg mb-4">Nog geen analyse uitgevoerd</p>
              <button
                onClick={onStartAnalysis}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Analyseer video voor gezichten
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-white mb-2">
                  {faces.length} {faces.length === 1 ? 'persoon' : 'personen'} gevonden in de video
                </p>
                <p className="text-gray-400 text-sm">
                  Selecteer de gezichten die je wilt blurren in de geëxporteerde video
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                {faces.map((face) => (
                  <div
                    key={face.id}
                    className={`relative rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedFaceIds.has(face.id)
                        ? 'ring-4 ring-purple-500 scale-105'
                        : 'ring-2 ring-gray-700 hover:ring-gray-600'
                    }`}
                    onClick={() => onToggleFace(face.id)}
                  >
                    <img
                      src={face.thumbnail}
                      alt={`Persoon ${face.id}`}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <input
                        type="checkbox"
                        checked={selectedFaceIds.has(face.id)}
                        onChange={() => onToggleFace(face.id)}
                        className="w-6 h-6 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {selectedFaceIds.has(face.id) && (
                      <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded">
                        Blur
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2">
                      {face.detections.length} frames
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-700 space-y-3">
                <button
                  onClick={onApplyBlur}
                  disabled={selectedFaceIds.size === 0}
                  className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  {selectedFaceIds.size === 0
                    ? 'Selecteer gezichten om te blurren'
                    : `Toepassen en exporteren (${selectedFaceIds.size} ${selectedFaceIds.size === 1 ? 'gezicht' : 'gezichten'})`}
                </button>
                <button
                  onClick={onStartAnalysis}
                  className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Opnieuw analyseren
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
