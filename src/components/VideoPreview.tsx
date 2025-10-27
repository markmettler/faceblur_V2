import { useEffect, useRef } from 'react';
import { useRecordingStore } from '../store/useRecordingStore';

interface VideoPreviewProps {
  stream: MediaStream | null;
}

export function VideoPreview({ stream }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isMirrored, mode } = useRecordingStore();

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (mode === 'audio') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-red-500/40 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-red-500/60 animate-pulse" />
            </div>
          </div>
          <p className="text-white text-xl font-medium">Audio-opname</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-contain ${isMirrored ? 'scale-x-[-1]' : ''}`}
      />
    </div>
  );
}
