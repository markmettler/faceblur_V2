import { Download, FileText, Eye, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useRecordingStore } from '../store/useRecordingStore';
import { downloadBlob, generateFilename } from '../utils/fileUtils';

interface DownloadPanelProps {
  onTranscribe: () => void;
  onDownloadTranscript: () => void;
  onOpenFaceAnalysis: () => void;
  onNewRecording: () => void;
}

export function DownloadPanel({ onTranscribe, onDownloadTranscript, onOpenFaceAnalysis, onNewRecording }: DownloadPanelProps) {
  const { videoBlob, mode, transcriptionText, status } = useRecordingStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDownloadVideo = async () => {
    if (!videoBlob) return;

    setIsProcessing(true);
    try {
      const extension = mode === 'video' ? 'mp4' : 'mp3';
      const filename = generateFilename('opname', extension);
      await downloadBlob(videoBlob, filename);
    } catch (err) {
      console.error('Download error:', err);
      alert('Fout bij downloaden');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!videoBlob || status === 'recording') return null;

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-xl font-bold">Opname voltooid</h3>
        <button
          onClick={onNewRecording}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
          title="Nieuwe opname starten"
        >
          <RotateCcw className="w-4 h-4" />
          Nieuwe opname
        </button>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleDownloadVideo}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <Download className="w-5 h-5" />
          {isProcessing ? 'Downloaden...' : `Download ${mode === 'video' ? 'video' : 'audio'} (origineel)`}
        </button>

        {mode === 'video' && (
          <button
            onClick={onOpenFaceAnalysis}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <Eye className="w-5 h-5" />
            Gezichten blurren (AVG)
          </button>
        )}

        {!transcriptionText && (
          <button
            onClick={onTranscribe}
            disabled={status === 'processing'}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <FileText className="w-5 h-5" />
            {status === 'processing' ? 'Transcriberen...' : 'Transcribeer nu'}
          </button>
        )}

        {transcriptionText && (
          <button
            onClick={onDownloadTranscript}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <Download className="w-5 h-5" />
            Download transcriptie
          </button>
        )}
      </div>
    </div>
  );
}
