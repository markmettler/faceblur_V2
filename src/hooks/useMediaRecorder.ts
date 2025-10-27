import { useRef, useCallback, useState } from 'react';
import { useRecordingStore } from '../store/useRecordingStore';

export function useMediaRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    mode,
    selectedCamera,
    selectedMicrophone,
    cameraFacingMode,
    setIsRecording,
    setRecordingTime,
    setRecordingStartTime,
    setVideoBlob,
    setStatus
  } = useRecordingStore();

  const getSupportedMimeType = (): string => {
    const types = [
      'video/mp4;codecs=h264,aac',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  };

  const startRecording = useCallback(async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: selectedMicrophone ? { exact: selectedMicrophone } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000,
        }
      };

      if (mode === 'video') {
        constraints.video = {
          facingMode: cameraFacingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        };

        if (selectedCamera) {
          constraints.video = {
            deviceId: { exact: selectedCamera },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 },
          };
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();

      if (!mimeType) {
        throw new Error('Geen ondersteunde opname-indeling gevonden');
      }

      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 5000000,
        audioBitsPerSecond: 128000,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setVideoBlob(blob);
        setStatus('processing');

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Opnamefout opgetreden');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
      setIsRecording(true);
      setStatus('recording');

      const startTime = Date.now();
      setRecordingStartTime(startTime);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime(Date.now() - startTime);
      }, 100);

      setError(null);
      return stream;
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Toegang geweigerd. Geef toestemming voor camera/microfoon.');
        } else if (err.name === 'NotFoundError') {
          setError('Geen camera of microfoon gevonden.');
        } else {
          setError(err.message);
        }
      }
      throw err;
    }
  }, [mode, selectedCamera, selectedMicrophone, cameraFacingMode, setIsRecording, setRecordingTime, setRecordingStartTime, setVideoBlob, setStatus]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [setIsRecording]);

  const getStream = useCallback(() => streamRef.current, []);

  return {
    startRecording,
    stopRecording,
    getStream,
    error,
  };
}
