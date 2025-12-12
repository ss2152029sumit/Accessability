import React from 'react';

interface DetectionPanelProps {
  content: string | null;
  lastUpdated: string;
}

const DetectionPanel: React.FC<DetectionPanelProps> = ({ content, lastUpdated }) => {
  // Function to format the description text with colors
  const formatContent = (text: string) => {
    const parts = text.split(/(\.|<br>)/g);
    
    return parts.map((part, index) => {
      if (!part) return null;
      
      let processedPart = part;
      const key = `part-${index}`;

      // We handle coloring by simple regex replacement strategy for rendering
      // Note: In React we can't just inject HTML string safely without dangerouslySetInnerHTML.
      // For safety, we will split by space and reconstruct, or use dangerouslySetInnerHTML on the full string if we pre-process it.
      // Given the requirement to follow the user's styling logic:
      
      const createMarkup = () => {
         let formatted = part;
         // Highlight hazards in red
         formatted = formatted.replace(
            /\b(hazard|danger|obstacle|caution|watch out|beware|avoid|drop|fall)\b/gi,
            '<strong class="text-red-500 font-bold">🚨 $&</strong>'
        );

        // Highlight locations in green
        formatted = formatted.replace(
            /\b(left|right|center|ahead|behind|forward|backward|top|bottom)\b/gi,
            '<strong class="text-green-400 font-bold">$&</strong>'
        );

        // Add distances in blue
        formatted = formatted.replace(
            /(\d+\s*(?:meters?|feet?|m|ft))/gi,
            '<em class="text-blue-500 not-italic font-bold">$&</em>'
        );

        return { __html: formatted };
      };

      return <span key={key} dangerouslySetInnerHTML={createMarkup()} />;
    });
  };

  return (
    <div className="bg-gradient-to-br from-surface to-neutral-800 border-2 border-neutral-800 rounded-xl p-8 min-h-[250px] mb-6 flex flex-col justify-between shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-400 uppercase tracking-widest font-semibold">
          🎯 Object Detection & Scene Analysis
        </div>
        <div className="bg-primary text-black px-3 py-1 rounded-full text-xs font-bold">
          {lastUpdated || 'Ready'}
        </div>
      </div>
      
      <div className={`text-xl leading-relaxed ${!content ? 'text-gray-600 italic text-center py-8' : 'text-white'}`}>
        {content ? (
          <div className="space-y-4">
             {/* We process the full block at once to handle sentence structures better if needed, 
                 but per the original code, it splits by '.' and adds breaks. */}
             {content.split('.').map((sentence, idx) => {
                if (!sentence.trim()) return null;
                // Re-implementing the user's "formatDescription" logic within React
                let formatted = sentence.trim();
                
                 // Highlight hazards
                formatted = formatted.replace(
                    /(hazard|danger|obstacle|caution|watch out|beware|avoid)/gi,
                    '<strong class="text-red-500 font-bold">🚨 $1</strong>'
                );

                // Highlight locations
                formatted = formatted.replace(
                    /(left|right|center|ahead|behind|forward|backward)/gi,
                    '<strong class="text-green-400 font-bold">$1</strong>'
                );

                // Highlight distances
                formatted = formatted.replace(
                    /(\d+\s*(?:meters?|feet?|m|ft))/gi,
                    '<em class="text-blue-500 not-italic font-bold">$1</em>'
                );

                return (
                  <div key={idx} dangerouslySetInnerHTML={{ __html: formatted + '.' }} />
                );
             })}
          </div>
        ) : (
          "Waiting for camera input..."
        )}
      </div>
    </div>
  );
};

export default DetectionPanel;