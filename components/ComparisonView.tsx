import React, { useState } from 'react';

interface ComparisonViewProps {
  original: string;
  processed: string | null;
  isProcessing: boolean;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ original, processed, isProcessing }) => {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  if (!processed && !isProcessing) {
    return (
      <div className="relative w-full aspect-[4/3] md:aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
        <img src={original} alt="Original" className="w-full h-full object-contain" />
      </div>
    );
  }

  return (
    <div 
      className="relative w-full aspect-[4/3] md:aspect-video rounded-xl overflow-hidden shadow-2xl bg-black select-none cursor-ew-resize group touch-none"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* Layer 1: Processed Image (Background/Underlying) */}
      <img 
        src={processed || original} 
        alt="Edited" 
        className={`absolute inset-0 w-full h-full object-contain ${isProcessing ? 'opacity-50 blur-sm' : ''}`} 
      />

      {isProcessing && (
         <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-indigo-400 font-semibold animate-pulse">Generating magic...</p>
            </div>
         </div>
      )}

      {/* Layer 2: Original Image (Foreground/Overlay) */}
      {/* We use clip-path to crop the image from the right side based on slider position. */}
      {/* This ensures the image aspect ratio remains consistent and doesn't distort. */}
      {processed && !isProcessing && (
        <>
          <img 
            src={original} 
            alt="Original" 
            className="absolute inset-0 w-full h-full object-contain z-10"
            style={{ 
              clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` 
            }}
          />

          {/* Slider Handle */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 font-bold text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-180 absolute"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </div>
          
          <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-sm pointer-events-none z-30">Original</div>
          <div className="absolute top-4 right-4 bg-indigo-600/50 text-white px-2 py-1 rounded text-xs backdrop-blur-sm pointer-events-none z-30">Edited</div>
        </>
      )}
    </div>
  );
};

export default ComparisonView;