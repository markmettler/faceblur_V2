import { X } from 'lucide-react';
import { useRecordingStore } from '../store/useRecordingStore';

interface LanguageSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const languages = [
  { code: 'nl', name: 'Nederlands' },
  { code: 'en', name: 'Engels' },
  { code: 'de', name: 'Duits' },
  { code: 'fr', name: 'Frans' },
  { code: 'es', name: 'Spaans' },
  { code: 'auto', name: 'Automatisch detecteren' },
];

export function LanguageSettingsModal({ isOpen, onClose }: LanguageSettingsModalProps) {
  const { selectedLanguage, setSelectedLanguage } = useRecordingStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Transcriptie-taal</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded p-1"
            aria-label="Sluiten"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setSelectedLanguage(lang.code);
                onClose();
              }}
              className={`w-full px-4 py-3 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                selectedLanguage === lang.code
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
