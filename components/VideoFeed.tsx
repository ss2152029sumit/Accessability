import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';

interface VideoFeedProps {
  isActive: boolean;
  onError: (error: string) => void;
}

export interface VideoFeedHandle {
  captureFrame: () => string | null;
  toggleTorch: (enable: boolean) => void;
}

const VideoFeed = forwardRef<VideoFeedHandle, VideoFeedProps>(({ isActive, onError }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useImperativeHandle(ref, () => ({
    captureFrame: () => {
      const video = videoRef.current;
      if (!video) return null;

      const canvas = document.createElement('canvas');
      // Downscale to 512px width for faster upload/processing while maintaining aspect ratio
      const scale = 512 / video.videoWidth;
      canvas.width = 512;
      canvas.height = video.videoHeight * scale;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Reduce quality slightly for speed (0.7)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      return dataUrl.split(',')[1];
    },
    toggleTorch: (enable: boolean) => {
        if (streamRef.current) {
            const track = streamRef.current.getVideoTracks()[0];
            // Check if torch is supported
            const capabilities = track.getCapabilities() as any;
            if (capabilities.torch) {
                track.applyConstraints({
                    advanced: [{ torch: enable } as any]
                }).catch(e => console.warn('Torch failed', e));
            }
        }
    }
  }));

  useEffect(() => {
    const startCamera = async () => {
      if (isActive && videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'environment',
              width: { ideal: 1280 }, // We capture high res for viewing
              height: { ideal: 720 }
            }
          });
          streamRef.current = stream;
          videoRef.current.srcObject = stream;
        } catch (err) {
          console.error("Camera access error:", err);
          onError("Camera access required. Please grant permissions.");
        }
      }
    };

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
            track.stop();
        });
        streamRef.current = null;
      }
      if (videoRef.current) {
          videoRef.current.srcObject = null;
      }
    };

    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive, onError]);

  return (
    <div className="bg-surface border-2 border-neutral-800 rounded-xl overflow-hidden aspect-video flex items-center justify-center mb-6 relative shadow-lg">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${!isActive ? 'hidden' : 'block'}`}
      />
      {!isActive && (
        <div className="text-center text-gray-500 flex flex-col items-center gap-4 p-4">
          <div className="text-6xl opacity-50">📷</div>
          <div className="text-lg font-medium">Click START to activate camera</div>
        </div>
      )}
    </div>
  );
});

VideoFeed.displayName = 'VideoFeed';

export default VideoFeed;