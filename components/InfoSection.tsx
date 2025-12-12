import React from 'react';

const InfoSection: React.FC = () => {
  return (
    <div className="bg-surface border-2 border-neutral-800 rounded-xl p-6 text-sm text-gray-400 shadow-lg">
      <div className="font-bold text-white text-lg mb-4">📋 How It Works</div>
      <div className="space-y-2">
        <div className="flex items-start gap-2">
            <span>✅</span>
            <span>Real-time analysis using Gemini 2.5 Flash</span>
        </div>
        <div className="flex items-start gap-2">
            <span>✅</span>
            <span>Instant hazard detection with audio & haptic feedback</span>
        </div>
        <div className="flex items-start gap-2">
            <span>✅</span>
            <span>Flashlight integration for low-light situations</span>
        </div>
        <div className="flex items-start gap-2">
            <span>✅</span>
            <span>Keyboard shortcuts: 'S' Start, 'X' Stop, 'L' Light</span>
        </div>
      </div>
    </div>
  );
};

export default InfoSection;