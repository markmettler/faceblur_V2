import { Circle, Square } from 'lucide-react';
import { useRecordingStore } from '../store/useRecordingStore';
import { formatTime } from '../utils/fileUtils';

interface RecordButtonProps {
  onStart: () => void;
  onStop: () => void;
}

export function RecordButton({ onStart, onStop }: RecordButtonProps) {
  const { isRecording, recordingTime, status } = useRecordingStore();

  const handleClick = () => {
    if (isRecording) {
      onStop();
    } else {
      onStart();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.code === 'Space' && !isRecording) {
      e.preventDefault();
      onStart();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={status === 'processing'}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all focus:outline-none focus:ring-4 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed ${
          isRecording
            ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/50'
            : 'bg-red-500 hover:bg-red-600 shadow-xl shadow-red-500/30 hover:scale-105'
        }`}
        aria-label={isRecording ? 'Stop opname' : 'Start opname'}
        title={isRecording ? 'Stop opname (Space)' : 'Start opname (Space)'}
      >
        {isRecording ? (
          <Square className="w-8 h-8 text-white fill-white" />
        ) : (
          <Circle className="w-10 h-10 text-white fill-red-500" />
        )}
      </button>

      {isRecording && (
        <div className="flex items-center gap-2 text-white bg-black/50 px-4 py-2 rounded-full">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="font-mono text-lg font-medium">
            {formatTime(recordingTime)}
          </span>
        </div>
      )}

      {status === 'processing' && (
        <div className="text-white text-sm">Verwerken...</div>
      )}
    </div>
  );
}
