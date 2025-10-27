import { Video, Mic, FlipHorizontal, Settings, Languages, SwitchCamera, Download } from 'lucide-react';
import { useRecordingStore } from '../store/useRecordingStore';
import { useState, useEffect } from 'react';

interface ControlBarProps {
  onOpenDeviceSettings: () => void;
  onOpenLanguageSettings: () => void;
  onToggleFaceBlur: () => void;
  onFlipCamera?: () => void;
}

export function ControlBar({
  onOpenDeviceSettings,
  onOpenLanguageSettings,
  onFlipCamera,
}: ControlBarProps) {
  const {
    mode,
    setMode,
    toggleMirror,
    isMirrored,
    isRecording,
  } = useRecordingStore();

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const isInStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isInStandalone);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if ((isIOS || isAndroid) && !isInStandalone) {
      setCanInstall(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS || !deferredPrompt) {
      setShowInstructions(true);
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setCanInstall(false);
      }
    } catch (err) {
      console.error('Install error:', err);
      setShowInstructions(true);
    }
  };

  const handleModeToggle = () => {
    if (!isRecording) {
      setMode(mode === 'video' ? 'audio' : 'video');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.code === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap px-4">
      <button
        onClick={handleModeToggle}
        onKeyDown={(e) => handleKeyDown(e, handleModeToggle)}
        disabled={isRecording}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label={`Schakel naar ${mode === 'video' ? 'audio' : 'video'} modus`}
        title={`Wissel modus (${mode === 'video' ? 'V' : 'A'})`}
      >
        {mode === 'video' ? (
          <>
            <Video className="w-5 h-5" />
            <span className="hidden sm:inline">Video</span>
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" />
            <span className="hidden sm:inline">Audio</span>
          </>
        )}
      </button>

      {mode === 'video' && (
        <>
          <button
            onClick={toggleMirror}
            onKeyDown={(e) => handleKeyDown(e, toggleMirror)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 ${
              isMirrored
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            aria-label="Schakel spiegelen"
            title="Spiegelen (M)"
          >
            <FlipHorizontal className="w-5 h-5" />
            <span className="hidden sm:inline">Spiegel</span>
          </button>

          {onFlipCamera && (
            <button
              onClick={onFlipCamera}
              onKeyDown={(e) => handleKeyDown(e, onFlipCamera)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Draai camera"
              title="Draai camera (ook tijdens opname)"
            >
              <SwitchCamera className="w-5 h-5" />
              <span className="hidden sm:inline">Draai</span>
            </button>
          )}
        </>
      )}

      <button
        onClick={onOpenDeviceSettings}
        onKeyDown={(e) => handleKeyDown(e, onOpenDeviceSettings)}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Apparaatinstellingen"
        title="Apparaten"
      >
        <Settings className="w-5 h-5" />
        <span className="hidden sm:inline">Apparaten</span>
      </button>

      <button
        onClick={onOpenLanguageSettings}
        onKeyDown={(e) => handleKeyDown(e, onOpenLanguageSettings)}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Taalinstellingen"
        title="Taal"
      >
        <Languages className="w-5 h-5" />
        <span className="hidden sm:inline">Taal</span>
      </button>

      {!isStandalone && (
        <button
          onClick={handleInstallClick}
          onKeyDown={(e) => handleKeyDown(e, handleInstallClick)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Installeer app"
          title="Installeer app"
        >
          <Download className="w-5 h-5" />
          <span className="hidden sm:inline">Installeer</span>
        </button>
      )}

      {showInstructions && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full text-white">
            <h3 className="text-xl font-bold mb-4">Installeer deze app</h3>
            <div className="space-y-4 text-sm mb-6">
              {/iPad|iPhone|iPod/.test(navigator.userAgent) ? (
                <>
                  <p className="font-semibold text-green-400">Voor iOS (Safari):</p>
                  <ol className="space-y-3">
                    <li className="flex gap-3">
                      <span className="font-bold">1.</span>
                      <span>Tik op het deel-icoon (vierkant met pijl omhoog) onderaan Safari</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">2.</span>
                      <span>Scroll naar beneden en tik op "Voeg toe aan beginscherm"</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">3.</span>
                      <span>Tik op "Voeg toe" rechtsboven</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">4.</span>
                      <span>De app wordt nu toegevoegd aan je beginscherm!</span>
                    </li>
                  </ol>
                </>
              ) : /Android/.test(navigator.userAgent) ? (
                <>
                  <p className="font-semibold text-green-400">Voor Android (Chrome):</p>
                  <ol className="space-y-3">
                    <li className="flex gap-3">
                      <span className="font-bold">1.</span>
                      <span>Tik op het menu-icoon (drie stippen) rechtsboven</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">2.</span>
                      <span>Tik op "App installeren" of "Toevoegen aan startscherm"</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">3.</span>
                      <span>Bevestig de installatie</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">4.</span>
                      <span>De app verschijnt nu op je startscherm!</span>
                    </li>
                  </ol>
                </>
              ) : (
                <>
                  <p className="font-semibold text-green-400">Installatie instructies:</p>
                  <ol className="space-y-3">
                    <li className="flex gap-3">
                      <span className="font-bold">1.</span>
                      <span>Klik op het menu-icoon in je browser</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">2.</span>
                      <span>Zoek naar "Installeren", "Toevoegen aan startscherm" of een vergelijkbare optie</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">3.</span>
                      <span>Bevestig de installatie</span>
                    </li>
                  </ol>
                </>
              )}
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
