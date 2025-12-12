import React, { useState } from 'react';

interface NavigationSectionProps {
  onSearch: (query: string) => void;
  isProcessing: boolean;
  result: { text: string; chunks: any[] } | null;
}

const NavigationSection: React.FC<NavigationSectionProps> = ({ onSearch, isProcessing, result }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="bg-surface border-2 border-neutral-800 rounded-xl p-6 mb-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🗺️</span>
        <h2 className="text-lg font-bold text-white uppercase tracking-wider">Smart Navigation & Maps</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., 'Nearest coffee shop?' or 'Walking route to park'"
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
        />
        <button
          type="submit"
          disabled={isProcessing || !query.trim()}
          className={`px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-all
            ${isProcessing || !query.trim() 
              ? 'bg-neutral-800 text-gray-500 cursor-not-allowed' 
              : 'bg-secondary text-white hover:bg-blue-600 hover:scale-105'
            }`}
        >
          {isProcessing ? 'Asking...' : 'Ask'}
        </button>
      </form>

      {result && (
        <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-800">
          <div className="text-gray-200 leading-relaxed whitespace-pre-wrap mb-4">
            {result.text}
          </div>
          
          {result.chunks && result.chunks.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-neutral-800">
              <span className="text-xs text-gray-500 w-full uppercase font-bold">Sources & Maps:</span>
              {result.chunks.map((chunk: any, idx: number) => {
                 // Handle Google Maps Grounding Chunks
                 if (chunk.web?.uri) {
                     return (
                         <a key={idx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" 
                            className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-1 rounded hover:bg-blue-500/20">
                            {chunk.web.title || 'Web Source'} 🔗
                         </a>
                     );
                 }
                 // Try to find maps specific URIs if structured differently in future API versions, 
                 // but typically they appear in chunks or directly in text for some models. 
                 // We will check for generic web uri which is standard for search/maps grounding return.
                 return null;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NavigationSection;