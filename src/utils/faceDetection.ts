import { FilesetResolver, FaceDetector, Detection } from '@mediapipe/tasks-vision';

let faceDetector: FaceDetector | null = null;

export interface TrackedFace {
  id: number;
  thumbnail: string;
  firstSeenTime: number;
  detections: Array<{
    timestamp: number;
    boundingBox: {
      originX: number;
      originY: number;
      width: number;
      height: number;
    };
  }>;
}

export async function initFaceDetector(): Promise<FaceDetector> {
  if (faceDetector) {
    return faceDetector;
  }

  try {
    console.log('Initializing face detector...');

    // Gebruik jsDelivr CDN voor MediaPipe bestanden (werkt altijd, zonder upload)
    const wasmPath = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm';
    const modelPath = 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';

    console.log('WASM path (CDN):', wasmPath);
    console.log('Model path (Google Cloud):', modelPath);

    const vision = await FilesetResolver.forVisionTasks(wasmPath);

    console.log('Vision fileset loaded, creating detector...');

    faceDetector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: modelPath,
        delegate: 'CPU'
      },
      runningMode: 'VIDEO',
      minDetectionConfidence: 0.5
    });

    console.log('Face detector initialized successfully');
    return faceDetector;
  } catch (err) {
    console.error('Face detector init error:', err);
    console.error('Error details:', {
      name: err instanceof Error ? err.name : 'Unknown',
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    if (err instanceof Error) {
      throw new Error('Fout bij initialiseren gezichtsdetectie: ' + err.message);
    }
    throw new Error('Fout bij initialiseren gezichtsdetectie: Onbekende fout');
  }
}

export async function analyzeVideoForFaces(
  videoBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<TrackedFace[]> {
  faceDetector = null;
  const detector = await initFaceDetector();

  const video = document.createElement('video');
  video.src = URL.createObjectURL(videoBlob);
  video.muted = true;

  await new Promise<void>((resolve) => {
    video.onloadedmetadata = () => resolve();
    video.load();
  });

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d')!;

  const trackedFaces: TrackedFace[] = [];
  const duration = video.duration;
  const sampleRate = 15;
  const totalFrames = Math.floor(duration * sampleRate);

  let lastTimestamp = 0;

  for (let i = 0; i < totalFrames; i++) {
    const timestamp = Math.floor((i / sampleRate) * 1000);
    if (timestamp <= lastTimestamp) {
      continue;
    }
    lastTimestamp = timestamp;

    video.currentTime = i / sampleRate;

    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
    });

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const detections = detector.detectForVideo(video, timestamp);

    detections.detections.forEach((detection) => {
      const box = detection.boundingBox;
      if (!box) return;

      const centroid = {
        x: box.originX + box.width / 2,
        y: box.originY + box.height / 2,
      };

      let matchedFace = trackedFaces.find((face) => {
        if (face.detections.length === 0) return false;
        const lastDetection = face.detections[face.detections.length - 1];
        const lastCentroid = {
          x: lastDetection.boundingBox.originX + lastDetection.boundingBox.width / 2,
          y: lastDetection.boundingBox.originY + lastDetection.boundingBox.height / 2,
        };

        const dist = Math.sqrt(
          Math.pow(lastCentroid.x - centroid.x, 2) +
          Math.pow(lastCentroid.y - centroid.y, 2)
        );

        return dist < 150;
      });

      if (matchedFace) {
        matchedFace.detections.push({
          timestamp,
          boundingBox: {
            originX: box.originX,
            originY: box.originY,
            width: box.width,
            height: box.height,
          },
        });
      } else {
        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = 100;
        thumbCanvas.height = 100;
        const thumbCtx = thumbCanvas.getContext('2d');

        if (thumbCtx) {
          thumbCtx.drawImage(
            canvas,
            box.originX,
            box.originY,
            box.width,
            box.height,
            0,
            0,
            100,
            100
          );

          const newFace: TrackedFace = {
            id: Date.now() + Math.random(),
            thumbnail: thumbCanvas.toDataURL('image/jpeg', 0.7),
            firstSeenTime: timestamp,
            detections: [{
              timestamp,
              boundingBox: {
                originX: box.originX,
                originY: box.originY,
                width: box.width,
                height: box.height,
              },
            }],
          };
          trackedFaces.push(newFace);
        }
      }
    });

    if (onProgress) {
      onProgress(((i + 1) / totalFrames) * 100);
    }
  }

  URL.revokeObjectURL(video.src);

  return trackedFaces.filter(face => face.detections.length >= 5);
}

function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export async function applyBlurToVideo(
  videoBlob: Blob,
  trackedFaces: TrackedFace[],
  selectedFaceIds: Set<number>,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const video = document.createElement('video');
  video.src = URL.createObjectURL(videoBlob);
  video.muted = false;
  video.playsInline = true;

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error('Video laden mislukt'));
    video.load();
  });

  await video.play();
  video.pause();
  video.currentTime = 0;

  const mobile = isMobile();
  const fps = mobile ? 15 : 30;
  const blurAmount = mobile ? 15 : 30;
  const scaleDown = mobile ? 0.75 : 1.0;
  const duration = video.duration;
  const totalFrames = Math.ceil(duration * fps);
  const frameTime = 1 / fps;

  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(video.videoWidth * scaleDown);
  canvas.height = Math.floor(video.videoHeight * scaleDown);
  const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: false, desynchronized: true })!;

  console.log(`Video verwerken: ${mobile ? 'mobiel' : 'desktop'} modus, ${fps} FPS, blur: ${blurAmount}px, resolutie: ${canvas.width}x${canvas.height}`);

  const stream = canvas.captureStream(fps);

  const audioContext = new AudioContext();
  const source = audioContext.createMediaElementSource(video);
  const destination = audioContext.createMediaStreamDestination();
  source.connect(destination);

  if (destination.stream.getAudioTracks().length > 0) {
    destination.stream.getAudioTracks().forEach(track => {
      stream.addTrack(track);
    });
  }

  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp8,opus',
    videoBitsPerSecond: 5000000,
    audioBitsPerSecond: 128000,
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const resultPromise = new Promise<Blob>((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const blurredBlob = new Blob(chunks, { type: 'video/webm' });
      audioContext.close();
      resolve(blurredBlob);
    };
    mediaRecorder.onerror = reject;
  });

  mediaRecorder.start(100);
  video.currentTime = 0;
  await video.play();

  let processedFrames = 0;
  let lastFrameTime = performance.now();
  let targetFrameDelay = 1000 / fps;

  const renderFrame = () => {
    if (video.ended || video.paused) {
      mediaRecorder.stop();
      URL.revokeObjectURL(video.src);
      console.log(`Video verwerkt: ${processedFrames} frames`);
      return;
    }

    const now = performance.now();
    const elapsed = now - lastFrameTime;

    if (elapsed < targetFrameDelay) {
      requestAnimationFrame(renderFrame);
      return;
    }

    lastFrameTime = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const currentTimeMs = video.currentTime * 1000;
    const facesToBlur = trackedFaces.filter(face => selectedFaceIds.has(face.id));

    facesToBlur.forEach((face) => {
      const detections = face.detections;
      const currentIdx = detections.findIndex(d => d.timestamp >= currentTimeMs);

      let box;

      if (currentIdx === 0) {
        box = detections[0].boundingBox;
      } else if (currentIdx === -1) {
        box = detections[detections.length - 1].boundingBox;
      } else {
        const prev = detections[currentIdx - 1];
        const next = detections[currentIdx];
        const timeDiff = next.timestamp - prev.timestamp;
        const ratio = timeDiff > 0 ? (currentTimeMs - prev.timestamp) / timeDiff : 0;

        box = {
          originX: prev.boundingBox.originX + (next.boundingBox.originX - prev.boundingBox.originX) * ratio,
          originY: prev.boundingBox.originY + (next.boundingBox.originY - prev.boundingBox.originY) * ratio,
          width: prev.boundingBox.width + (next.boundingBox.width - prev.boundingBox.width) * ratio,
          height: prev.boundingBox.height + (next.boundingBox.height - prev.boundingBox.height) * ratio,
        };
      }

      if (box) {
        const padding = mobile ? 25 : 40;
        const x = Math.max(0, (box.originX - padding) * scaleDown);
        const y = Math.max(0, (box.originY - padding) * scaleDown);
        const width = Math.min(canvas.width - x, (box.width + padding * 2) * scaleDown);
        const height = Math.min(canvas.height - y, (box.height + padding * 2) * scaleDown);

        ctx.save();
        ctx.filter = `blur(${blurAmount}px)`;
        ctx.drawImage(canvas, x, y, width, height, x, y, width, height);
        ctx.restore();
      }
    });

    processedFrames++;
    if (onProgress && processedFrames % 5 === 0) {
      const progress = Math.min(95, (video.currentTime / duration) * 100);
      onProgress(progress);
    }

    requestAnimationFrame(renderFrame);
  };

  renderFrame();

  const result = await resultPromise;

  if (onProgress) {
    onProgress(100);
  }

  return result;
}
