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
      <div className="relative w-full aspect-[4/3] md:aspect-video rounded-xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
        <img src={original} alt="Original" className="w-full h-full object-contain" />
      </div>
    );
  }

  return (
    <div 
      className="relative w-full aspect-[4/3] md:aspect-video rounded-xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 select-none cursor-ew-resize group touch-none"
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
            <div className="flex flex-col items-center p-4 rounded-lg bg-zinc-900/80 backdrop-blur-sm text-zinc-50">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm font-medium animate-pulse">Generating...</p>
            </div>
         </div>
      )}

      {/* Layer 2: Original Image (Foreground/Overlay) */}
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
            className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize z-20 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-zinc-900 font-bold text-xs ring-2 ring-zinc-900/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </div>
          
          <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-md text-xs font-medium backdrop-blur-md pointer-events-none z-30">Original</div>
          <div className="absolute top-4 right-4 bg-indigo-600/90 text-white px-3 py-1.5 rounded-md text-xs font-medium backdrop-blur-md pointer-events-none z-30">Edited</div>
        </>
      )}
    </div>
  );
};

export default ComparisonView;