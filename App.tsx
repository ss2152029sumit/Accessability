import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import StatusSection from './components/StatusSection';
import VideoFeed, { VideoFeedHandle } from './components/VideoFeed';
import DetectionPanel from './components/DetectionPanel';
import Controls from './components/Controls';
import InfoSection from './components/InfoSection';
import { analyzeImage } from './services/geminiService';
import { speakText, cancelSpeech } from './services/ttsService';
import { playSound, triggerHaptic } from './services/audioUtils';

const App: React.FC = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isTorchEnabled, setIsTorchEnabled] = useState(false);
  const [status, setStatus] = useState<'ready' | 'analyzing' | 'error'>('ready');
  const [description, setDescription] = useState<string | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const videoFeedRef = useRef<VideoFeedHandle>(null);
  const isDetectingRef = useRef(isDetecting);
  const isAudioEnabledRef = useRef(isAudioEnabled);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track the timestamp of the latest request to prevent race conditions
  const lastRequestTimestampRef = useRef<number>(0);

  useEffect(() => {
    isDetectingRef.current = isDetecting;
    if (!isDetecting) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } else {
        // Start the loop
        scheduleNextFrame(0);
    }
  }, [isDetecting]);

  useEffect(() => {
    isAudioEnabledRef.current = isAudioEnabled;
    if (!isAudioEnabled) {
      cancelSpeech();
    }
  }, [isAudioEnabled]);

  const handleStart = useCallback(() => {
    playSound('start');
    triggerHaptic('success');
    setIsDetecting(true);
    setStatus('analyzing');
    setDescription('Starting vision system...');
    
    if (isAudioEnabled) {
      speakText("System active.");
    }
    
    setFrameCount(0);
    setSuccessCount(0);
    setErrorMsg(null);
  }, [isAudioEnabled]);

  const handleStop = useCallback(() => {
    playSound('stop');
    cancelSpeech();
    setIsDetecting(false);
    setIsTorchEnabled(false);
    setStatus('ready');
    setDescription(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const handleToggleTorch = useCallback(() => {
    const newState = !isTorchEnabled;
    setIsTorchEnabled(newState);
    if (videoFeedRef.current) {
      videoFeedRef.current.toggleTorch(newState);
    }
    speakText(newState ? "Light on" : "Light off");
  }, [isTorchEnabled]);

  const handleError = useCallback((msg: string) => {
    triggerHaptic('error');
    setErrorMsg(msg);
    setStatus('error');
    if (isAudioEnabledRef.current) {
      speakText("System error.");
    }
    setTimeout(() => setErrorMsg(null), 5000);
  }, []);

  const processFrame = async () => {
    if (!isDetectingRef.current || !videoFeedRef.current) return;

    setFrameCount(prev => prev + 1);
    
    // Mark this request's start time
    const currentRequestTime = Date.now();
    lastRequestTimestampRef.current = currentRequestTime;

    try {
      const base64Image = videoFeedRef.current.captureFrame();
      
      if (!base64Image) {
          scheduleNextFrame(1000);
          return;
      }

      const resultText = await analyzeImage(base64Image);
      
      // CRITICAL: Only update state if this is still the LATEST request
      if (isDetectingRef.current && lastRequestTimestampRef.current === currentRequestTime) {
        
        setDescription(resultText);
        setSuccessCount(prev => prev + 1);
        setStatus('analyzing');

        // --- Accessibility Features ---
        const textLower = resultText.toLowerCase();
        const isHazard = textLower.includes('hazard') || 
                         textLower.includes('danger') ||
                         textLower.includes('stop') ||
                         textLower.includes('blocked') ||
                         textLower.includes('caution');

        if (isHazard) {
          playSound('hazard');
          triggerHaptic('warning');
        } else {
          playSound('success');
        }

        if (isAudioEnabledRef.current) {
          speakText(resultText);
        }
        
        // Success? Wait 3s before next scan to save quota and give time to read
        scheduleNextFrame(3000);
      }

    } catch (error: any) {
       if (lastRequestTimestampRef.current === currentRequestTime) {
          console.error("Analysis failed", error);
          if (isDetectingRef.current) {
               const errorText = error?.message || '';
               
               if (errorText.includes('429')) {
                 console.warn("Rate limit hit. Cooling down...");
                 setStatus('error');
                 setDescription("⚠️ Quota limit. Cooling down for 10s...");
                 if (isAudioEnabledRef.current) speakText("Quota limit. Waiting.");
                 // Wait 10 seconds before retrying if rate limited
                 scheduleNextFrame(10000);
               } else {
                 // Other errors, retry in 3s
                 scheduleNextFrame(3000);
               }
           }
       }
    }
  };

  const scheduleNextFrame = (delay: number) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (isDetectingRef.current) {
          timeoutRef.current = setTimeout(() => {
              processFrame();
          }, delay);
      }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key.toLowerCase() === 's') {
        if (!isDetectingRef.current) {
          e.preventDefault();
          handleStart();
        }
      } else if (e.key.toLowerCase() === 'x') {
        if (isDetectingRef.current) {
          e.preventDefault();
          handleStop();
        }
      } else if (e.key.toLowerCase() === 'l') {
        if (isDetectingRef.current) {
          e.preventDefault();
          handleToggleTorch();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStart, handleStop, handleToggleTorch]);

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-4xl mx-auto pb-24">
      <Header />

      {errorMsg && (
        <div 
          role="alert" 
          className="bg-red-500/10 border-l-4 border-danger p-4 rounded-lg text-danger mb-6 animate-pulse"
        >
          {errorMsg}
        </div>
      )}

      <StatusSection 
        status={status} 
        frameCount={frameCount} 
        successCount={successCount} 
      />

      <VideoFeed 
        ref={videoFeedRef}
        isActive={isDetecting} 
        onError={handleError}
      />

      <DetectionPanel 
        content={description}
        lastUpdated={isDetecting ? `Scan ${successCount}` : 'Ready'}
      />

      <Controls 
        isDetecting={isDetecting}
        isAudioEnabled={isAudioEnabled}
        isTorchEnabled={isTorchEnabled}
        onStart={handleStart}
        onStop={handleStop}
        onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)}
        onToggleTorch={handleToggleTorch}
      />

      <InfoSection />
    </div>
  );
};

export default App;