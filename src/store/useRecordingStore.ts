import { create } from 'zustand';

export type RecordingMode = 'video' | 'audio';
export type RecordingStatus = 'idle' | 'recording' | 'processing' | 'ready';
export type CameraFacingMode = 'user' | 'environment';

interface RecordingState {
  mode: RecordingMode;
  status: RecordingStatus;
  isRecording: boolean;
  recordingTime: number;
  recordingStartTime: number;
  selectedCamera: string;
  selectedMicrophone: string;
  isMirrored: boolean;
  faceBlurEnabled: boolean;
  transcriptionEnabled: boolean;
  selectedLanguage: string;
  videoBlob: Blob | null;
  transcriptionText: string;
  cameraFacingMode: CameraFacingMode;
  previewEnabled: boolean;

  setMode: (mode: RecordingMode) => void;
  setStatus: (status: RecordingStatus) => void;
  setIsRecording: (isRecording: boolean) => void;
  setRecordingTime: (time: number) => void;
  setRecordingStartTime: (time: number) => void;
  setSelectedCamera: (deviceId: string) => void;
  setSelectedMicrophone: (deviceId: string) => void;
  toggleMirror: () => void;
  setFaceBlurEnabled: (enabled: boolean) => void;
  setTranscriptionEnabled: (enabled: boolean) => void;
  setSelectedLanguage: (language: string) => void;
  setVideoBlob: (blob: Blob | null) => void;
  setTranscriptionText: (text: string) => void;
  toggleCameraFacing: () => void;
  setPreviewEnabled: (enabled: boolean) => void;
  reset: () => void;
}

export const useRecordingStore = create<RecordingState>((set) => ({
  mode: 'video',
  status: 'idle',
  isRecording: false,
  recordingTime: 0,
  recordingStartTime: 0,
  selectedCamera: '',
  selectedMicrophone: '',
  isMirrored: true,
  faceBlurEnabled: false,
  transcriptionEnabled: false,
  selectedLanguage: 'nl',
  videoBlob: null,
  transcriptionText: '',
  cameraFacingMode: 'user',
  previewEnabled: true,

  setMode: (mode) => set({ mode }),
  setStatus: (status) => set({ status }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setRecordingTime: (time) => set({ recordingTime: time }),
  setRecordingStartTime: (time) => set({ recordingStartTime: time }),
  setSelectedCamera: (deviceId) => set({ selectedCamera: deviceId }),
  setSelectedMicrophone: (deviceId) => set({ selectedMicrophone: deviceId }),
  toggleMirror: () => set((state) => ({ isMirrored: !state.isMirrored })),
  setFaceBlurEnabled: (enabled) => set({ faceBlurEnabled: enabled }),
  setTranscriptionEnabled: (enabled) => set({ transcriptionEnabled: enabled }),
  setSelectedLanguage: (language) => set({ selectedLanguage: language }),
  setVideoBlob: (blob) => set({ videoBlob: blob }),
  setTranscriptionText: (text) => set({ transcriptionText: text }),
  toggleCameraFacing: () => set((state) => ({
    cameraFacingMode: state.cameraFacingMode === 'user' ? 'environment' : 'user'
  })),
  setPreviewEnabled: (enabled) => set({ previewEnabled: enabled }),
  reset: () => set({
    status: 'idle',
    isRecording: false,
    recordingTime: 0,
    recordingStartTime: 0,
    videoBlob: null,
    transcriptionText: ''
  }),
}));
