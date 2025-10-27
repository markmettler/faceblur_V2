import { useState, useEffect } from 'react';

export interface MediaDeviceInfo {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export function useMediaDevices() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadDevices = async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      setDevices(deviceList as MediaDeviceInfo[]);

      const videoDevices = deviceList.filter(d => d.kind === 'videoinput');
      const audioDevices = deviceList.filter(d => d.kind === 'audioinput');

      setCameras(videoDevices as MediaDeviceInfo[]);
      setMicrophones(audioDevices as MediaDeviceInfo[]);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError('Fout bij laden van apparaten: ' + err.message);
      }
    }
  };

  useEffect(() => {
    loadDevices();

    const handleDeviceChange = () => {
      loadDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);

  return { devices, cameras, microphones, error, reload: loadDevices };
}
