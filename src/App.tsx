import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { useRecordingStore } from './store/useRecordingStore';
import { useMediaRecorder } from './hooks/useMediaRecorder';
import { VideoPreview } from './components/VideoPreview';
import { RecordButton } from './components/RecordButton';
import { ControlBar } from './components/ControlBar';
import { DeviceSettingsModal } from './components/DeviceSettingsModal';
import { LanguageSettingsModal } from './components/LanguageSettingsModal';
import { FaceAnalysisModal } from './components/FaceAnalysisModal';
import { DownloadPanel } from './components/DownloadPanel';
import { TrackedFace, analyzeVideoForFaces, applyBlurToVideo } from './utils/faceDetection';
import { transcribeAudio, segmentsToText } from './utils/transcriptionUtils';
import { createDocxFromTranscription, createTextFromTranscription } from './utils/docxUtils';
import { downloadBlob, generateFilename } from './utils/fileUtils';

function App() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [showLanguageSettings, setShowLanguageSettings] = useState(false);
  const [showFaceAnalysisModal, setShowFaceAnalysisModal] = useState(false);
  const [trackedFaces, setTrackedFaces] = useState<TrackedFace[]>([]);
  const [selectedFaceIds, setSelectedFaceIds] = useState<Set<number>>(new Set());
  const [transcriptionProgress, setTranscriptionProgress] = useState<string>('');
  const [isAnalyzingFaces, setIsAnalyzingFaces] = useState(false);
  const [faceAnalysisProgress, setFaceAnalysisProgress] = useState(0);
  const [isApplyingBlur, setIsApplyingBlur] = useState(false);
  const [blurProgress, setBlurProgress] = useState(0);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);

  const { startRecording, stopRecording, error: recorderError } = useMediaRecorder();
  const {
    videoBlob,
    selectedLanguage,
    setTranscriptionText,
    status,
    setStatus,
    mode,
  } = useRecordingStore();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('SW registration failed:', err);
      });
    }

    const startPreview = async () => {
      try {
        const previewMediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
        setPreviewStream(previewMediaStream);
      } catch (err) {
        console.log('Preview not available:', err);
      }
    };

    startPreview();

    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    setTrackedFaces([]);
    setSelectedFaceIds(new Set());
    setIsAnalyzingFaces(false);
    setFaceAnalysisProgress(0);
  }, [videoBlob]);

  const handleStartRecording = async () => {
    try {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
        setPreviewStream(null);
      }
      const newStream = await startRecording();
      setStream(newStream);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const handleStopRecording = async () => {
    stopRecording();
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    try {
      const newPreviewStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });
      setPreviewStream(newPreviewStream);
    } catch (err) {
      console.error('Failed to restart preview:', err);
    }
  };

  const handleOpenFaceAnalysis = () => {
    setShowFaceAnalysisModal(true);
  };

  const handleStartFaceAnalysis = async () => {
    if (!videoBlob || mode !== 'video') return;

    try {
      setIsAnalyzingFaces(true);
      setFaceAnalysisProgress(0);

      const faces = await analyzeVideoForFaces(videoBlob, (progress) => {
        setFaceAnalysisProgress(progress);
      });

      setTrackedFaces(faces);
      setIsAnalyzingFaces(false);
    } catch (err) {
      console.error('Face analysis error:', err);
      alert('Fout bij analyseren van gezichten: ' + (err as Error).message);
      setIsAnalyzingFaces(false);
    }
  };

  const handleToggleFace = (faceId: number) => {
    setSelectedFaceIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(faceId)) {
        newSet.delete(faceId);
      } else {
        newSet.add(faceId);
      }
      return newSet;
    });
  };

  const handleApplyBlur = async () => {
    if (!videoBlob || selectedFaceIds.size === 0) return;

    try {
      setIsApplyingBlur(true);
      setBlurProgress(0);
      setShowFaceAnalysisModal(false);

      const blurredBlob = await applyBlurToVideo(
        videoBlob,
        trackedFaces,
        selectedFaceIds,
        (progress) => {
          setBlurProgress(progress);
        }
      );

      const filename = generateFilename('opname-geblurd', 'webm');
      await downloadBlob(blurredBlob, filename);

      setIsApplyingBlur(false);
      setBlurProgress(0);
    } catch (err) {
      console.error('Blur application error:', err);
      alert('Fout bij toepassen van blur: ' + (err as Error).message);
      setIsApplyingBlur(false);
      setBlurProgress(0);
    }
  };

  const handleTranscribe = async () => {
    if (!videoBlob) return;

    try {
      setStatus('processing');
      setTranscriptionProgress('Transcriptie starten...');

      const segments = await transcribeAudio(
        videoBlob,
        selectedLanguage,
        (progress, message) => {
          setTranscriptionProgress(`${message} (${Math.round(progress)}%)`);
        }
      );

      const text = segmentsToText(segments);
      setTranscriptionText(text);
      setStatus('idle');
      setTranscriptionProgress('');
    } catch (err) {
      console.error('Transcription error:', err);
      alert('Transcriptiefout: ' + (err as Error).message);
      setStatus('idle');
      setTranscriptionProgress('');
    }
  };

  const handleDownloadTranscript = async () => {
    if (!videoBlob) return;

    try {
      const segments = await transcribeAudio(videoBlob, selectedLanguage);

      try {
        const docxBlob = await createDocxFromTranscription(segments, 'Transcriptie');
        const filename = generateFilename('transcriptie', 'docx');
        await downloadBlob(docxBlob, filename);
      } catch (docxErr) {
        console.warn('DOCX export failed, falling back to TXT:', docxErr);
        const text = createTextFromTranscription(segments, 'Transcriptie');
        const txtBlob = new Blob([text], { type: 'text/plain' });
        const filename = generateFilename('transcriptie', 'txt');
        await downloadBlob(txtBlob, filename);
      }
    } catch (err) {
      console.error('Download transcript error:', err);
      alert('Fout bij downloaden transcriptie');
    }
  };

  const handleNewRecording = async () => {
    const { reset } = useRecordingStore.getState();
    reset();
    setTrackedFaces([]);
    setSelectedFaceIds(new Set());
    setTranscriptionProgress('');
    setIsAnalyzingFaces(false);
    setFaceAnalysisProgress(0);
    setIsApplyingBlur(false);
    setBlurProgress(0);

    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
      setPreviewStream(null);
    }

    try {
      const newPreviewStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      setPreviewStream(newPreviewStream);
    } catch (err) {
      console.error('Failed to restart preview:', err);
    }
  };

  const handleFlipCamera = async () => {
    const { cameraFacingMode, toggleCameraFacing, isRecording, selectedMicrophone } = useRecordingStore.getState();

    toggleCameraFacing();
    const newFacingMode = cameraFacingMode === 'user' ? 'environment' : 'user';

    if (isRecording && stream) {
      // Stop current recording stream
      stream.getTracks().forEach(track => track.stop());

      try {
        // Create new stream with flipped camera during recording
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: newFacingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          },
          audio: selectedMicrophone ? {
            deviceId: { exact: selectedMicrophone },
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 48000
          } : {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 48000
          }
        });
        setStream(newStream);
      } catch (err) {
        console.error('Failed to flip camera during recording, trying without exact:', err);
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: newFacingMode,
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              frameRate: { ideal: 30 }
            },
            audio: selectedMicrophone ? {
              deviceId: { exact: selectedMicrophone },
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 48000
            } : {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 48000
            }
          });
          setStream(fallbackStream);
        } catch (fallbackErr) {
          console.error('Failed to flip camera:', fallbackErr);
          toggleCameraFacing();
        }
      }
    } else if (previewStream) {
      // Handle flip for preview stream when not recording
      previewStream.getTracks().forEach(track => track.stop());
      setPreviewStream(null);

      try {
        const newPreviewStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: newFacingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
        setPreviewStream(newPreviewStream);
      } catch (err) {
        console.error('Failed to flip camera with exact constraint, trying without exact:', err);
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: newFacingMode,
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            },
            audio: false
          });
          setPreviewStream(fallbackStream);
        } catch (fallbackErr) {
          console.error('Failed to flip camera:', fallbackErr);
          toggleCameraFacing();
        }
      }
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col overflow-hidden">
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl font-bold">O</span>
            </div>
            <h1 className="text-white text-2xl font-bold">Opname & Transcribe Studio</h1>
          </div>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Shield className="w-5 h-5" />
            <span className="hidden sm:inline">On-device processing</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 relative">
          <VideoPreview stream={stream || previewStream} />
        </div>

        <div className="fixed bottom-0 left-0 right-0 pb-safe">
          <div className="bg-gradient-to-t from-black/80 via-black/60 to-transparent pt-8 pb-4 space-y-4 relative">
            <div className="relative z-10">
              <RecordButton onStart={handleStartRecording} onStop={handleStopRecording} />
            </div>

            <div className="relative z-20">
              <ControlBar
                onOpenDeviceSettings={() => setShowDeviceSettings(true)}
                onOpenLanguageSettings={() => setShowLanguageSettings(true)}
                onToggleFaceBlur={() => {}}
                onFlipCamera={handleFlipCamera}
              />
            </div>
          </div>
        </div>

        {recorderError && (
          <div className="absolute top-4 left-4 right-4 bg-red-500/90 text-white p-4 rounded-lg shadow-lg">
            {recorderError}
          </div>
        )}

        {transcriptionProgress && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500/90 text-white px-6 py-3 rounded-lg shadow-lg">
            {transcriptionProgress}
          </div>
        )}

        {isApplyingBlur && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-purple-500/90 text-white px-6 py-4 rounded-lg shadow-lg min-w-[300px]">
            <p className="mb-2">Gezichten blurren...</p>
            <div className="w-full bg-purple-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-300"
                style={{ width: `${blurProgress}%` }}
              />
            </div>
            <p className="text-sm mt-1">{Math.round(blurProgress)}%</p>
          </div>
        )}
      </main>

      <DownloadPanel
        onTranscribe={handleTranscribe}
        onDownloadTranscript={handleDownloadTranscript}
        onOpenFaceAnalysis={handleOpenFaceAnalysis}
        onNewRecording={handleNewRecording}
      />

      <DeviceSettingsModal
        isOpen={showDeviceSettings}
        onClose={() => setShowDeviceSettings(false)}
      />

      <LanguageSettingsModal
        isOpen={showLanguageSettings}
        onClose={() => setShowLanguageSettings(false)}
      />

      <FaceAnalysisModal
        isOpen={showFaceAnalysisModal}
        onClose={() => setShowFaceAnalysisModal(false)}
        faces={trackedFaces}
        selectedFaceIds={selectedFaceIds}
        onToggleFace={handleToggleFace}
        isAnalyzing={isAnalyzingFaces}
        analysisProgress={faceAnalysisProgress}
        onStartAnalysis={handleStartFaceAnalysis}
        onApplyBlur={handleApplyBlur}
      />
    </div>
  );
}

export default App;
