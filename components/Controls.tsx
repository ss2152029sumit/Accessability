import React from 'react';

interface ControlsProps {
  isDetecting: boolean;
  isAudioEnabled: boolean;
  isTorchEnabled: boolean;
  onStart: () => void;
  onStop: () => void;
  onToggleAudio: () => void;
  onToggleTorch: () => void;
}

const Controls: React.FC<ControlsProps> = ({ 
    isDetecting, 
    isAudioEnabled, 
    isTorchEnabled,
    onStart, 
    onStop, 
    onToggleAudio,
    onToggleTorch 
}) => {
  return (
    <div className="flex flex-col items-center gap-6 mb-8">
      {/* Main Transport Controls */}
      <div className="flex gap-6 justify-center flex-wrap items-center">
        <button
          onClick={onStart}
          disabled={isDetecting}
          title="Start (Press S)"
          aria-label="Start detection"
          className={`
              w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(74,222,128,0.3)]
              transition-all duration-200 ease-in-out font-bold uppercase tracking-wider
              ${isDetecting 
                  ? 'opacity-40 cursor-not-allowed bg-gray-700 text-gray-400' 
                  : 'bg-gradient-to-br from-primary to-green-500 text-black hover:scale-110 hover:shadow-[0_0_50px_rgba(74,222,128,0.6)] active:scale-95'
              }
          `}
        >
          ▶️
        </button>

        <button
          onClick={onStop}
          disabled={!isDetecting}
          title="Stop (Press X)"
          aria-label="Stop detection"
          className={`
              w-20 h-20 rounded-xl flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(239,68,68,0.3)]
              transition-all duration-200 ease-in-out font-bold uppercase tracking-wider
              ${!isDetecting 
                  ? 'opacity-40 cursor-not-allowed bg-gray-700 text-gray-400' 
                  : 'bg-gradient-to-br from-danger to-red-600 text-white hover:scale-110 hover:shadow-[0_0_40px_rgba(239,68,68,0.6)] active:scale-95'
              }
          `}
        >
          ⏹️
        </button>
      </div>

      {/* Secondary Toggles */}
      <div className="flex gap-4">
        <button
            onClick={onToggleAudio}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-800 border border-neutral-700 text-gray-300 hover:bg-neutral-700 transition-colors"
            aria-label={isAudioEnabled ? "Mute audio" : "Enable audio"}
        >
            <span>{isAudioEnabled ? '🔊' : '🔇'}</span>
            <span className="text-sm font-medium">{isAudioEnabled ? 'Voice ON' : 'Voice OFF'}</span>
        </button>

        <button
            onClick={onToggleTorch}
            disabled={!isDetecting}
            className={`
                flex items-center gap-2 px-6 py-3 rounded-full border transition-colors
                ${isTorchEnabled 
                    ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' 
                    : 'bg-neutral-800 border-neutral-700 text-gray-300 hover:bg-neutral-700'
                }
                ${!isDetecting ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            aria-label={isTorchEnabled ? "Turn off flashlight" : "Turn on flashlight"}
        >
            <span>{isTorchEnabled ? '🔦' : '💡'}</span>
            <span className="text-sm font-medium">{isTorchEnabled ? 'Light ON' : 'Light OFF'}</span>
        </button>
      </div>
    </div>
  );
};

export default Controls;