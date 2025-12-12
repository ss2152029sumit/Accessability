import React from 'react';

interface StatusSectionProps {
  status: 'ready' | 'analyzing' | 'error';
  frameCount: number;
  successCount: number;
}

const StatusSection: React.FC<StatusSectionProps> = ({ status, frameCount, successCount }) => {
  return (
    <div className="bg-gradient-to-br from-surface to-neutral-800 border-2 border-primary rounded-xl p-6 mb-6 flex flex-wrap gap-4 justify-between items-center shadow-lg">
      <div className="flex-1 min-w-[200px]">
        <div className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-semibold">
          System Status
        </div>
        <div className={`text-2xl font-bold flex items-center gap-2 ${
          status === 'analyzing' ? 'text-secondary' : 
          status === 'error' ? 'text-danger' : 'text-primary'
        }`}>
          {status === 'ready' && 'Ready'}
          {status === 'analyzing' && (
            <>
              Live Scan <span className="inline-block w-3 h-3 rounded-full bg-primary animate-pulse" />
            </>
          )}
          {status === 'error' && 'Error'}
        </div>
      </div>

      <div className="flex-1 min-w-[200px]">
        <div className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-semibold">
          AI Model
        </div>
        <div className="text-2xl font-bold text-primary">
          Gemini 3 Pro
        </div>
      </div>

      <div className="flex-1 min-w-[200px]">
        <div className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-semibold">
          Stats
        </div>
        <div className="text-2xl font-bold text-gray-300">
          <span className="text-green-400">{successCount}</span> / <span className="text-gray-500">{frameCount}</span>
        </div>
      </div>
    </div>
  );
};

export default StatusSection;