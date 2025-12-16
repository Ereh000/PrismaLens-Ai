import React, { useState, useRef, useEffect } from 'react';
import { 
  EditMode, 
  ImageState, 
  PresetConfig 
} from './types';
import { generateEditedImage } from './services/gemini';
import ImageUploader from './components/ImageUploader';
import ComparisonView from './components/ComparisonView';
import { 
  MagicIcon, 
  SparklesIcon, 
  WandIcon, 
  SunIcon, 
  GhostIcon, 
  ZapIcon,
  DownloadIcon,
  RefreshIcon
} from './components/Icons';

const PRESETS: PresetConfig[] = [
  {
    id: EditMode.GHIBLI,
    label: 'Ghibli Style',
    description: 'Turn into anime art',
    icon: 'sparkles',
    color: 'from-green-400 to-emerald-600',
    prompt: 'Transform this image into a high-quality Studio Ghibli style anime scene. Maintain the composition and key subjects but render them with the signature vibrant colors, fluffy clouds, and hand-drawn aesthetic of Ghibli movies.'
  },
  {
    id: EditMode.QUALITY,
    label: 'Enhance',
    description: 'Boost clarity & detail',
    icon: 'sun',
    color: 'from-blue-400 to-indigo-600',
    prompt: 'Significantly enhance the quality of this image. Increase resolution, sharpness, and clarity. Remove noise and artifacts. Make it look like a professional high-definition photograph.'
  },
  {
    id: EditMode.REFINE,
    label: 'Refine Face',
    description: 'Smooth & beautify',
    icon: 'wand',
    color: 'from-pink-400 to-rose-600',
    prompt: 'Retouch the facial features in this image. Smooth the skin naturally while preserving texture and details. Enhance lighting on the face for a professional portrait look.'
  },
  {
    id: EditMode.BATMAN,
    label: 'Gotham City',
    description: 'Dark cinematic look',
    icon: 'ghost',
    color: 'from-slate-700 to-black',
    prompt: 'Apply a dark, gritty, cinematic Batman-style aesthetic to this image. High contrast, shadows, rain effects if appropriate, cool color temperature, and a dramatic, brooding atmosphere.'
  },
  {
    id: EditMode.POTTER,
    label: 'Wizard World',
    description: 'Magical effects',
    icon: 'zap',
    color: 'from-amber-400 to-orange-600',
    prompt: 'Transform this image with a Harry Potter wizarding world aesthetic. Add magical glows, floating particles, vintage coloring, and a mysterious, enchanted atmosphere.'
  },
];

const App: React.FC = () => {
  const [imageState, setImageState] = useState<ImageState>({
    original: null,
    processed: null,
    isProcessing: false,
    error: null,
  });

  const [activeMode, setActiveMode] = useState<EditMode | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (base64: string) => {
    setImageState({
      original: base64,
      processed: null,
      isProcessing: false,
      error: null,
    });
    setActiveMode(null);
  };

  const handleProcess = async (mode: EditMode, promptOverride?: string) => {
    if (!imageState.original) return;

    setImageState(prev => ({ ...prev, isProcessing: true, error: null }));
    setActiveMode(mode);

    // Scroll to result on mobile
    setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    try {
      let prompt = '';
      if (mode === EditMode.CUSTOM) {
        prompt = promptOverride || customPrompt;
        if (!prompt.trim()) {
            throw new Error("Please enter a prompt");
        }
      } else {
        const preset = PRESETS.find(p => p.id === mode);
        prompt = preset?.prompt || '';
      }

      const processedImage = await generateEditedImage(imageState.original, prompt);
      
      setImageState(prev => ({
        ...prev,
        processed: processedImage,
        isProcessing: false,
      }));
    } catch (err: any) {
      setImageState(prev => ({
        ...prev,
        isProcessing: false,
        error: err.message || 'Failed to process image',
      }));
    }
  };

  const handleReset = () => {
    setImageState({
      original: null,
      processed: null,
      isProcessing: false,
      error: null,
    });
    setActiveMode(null);
    setCustomPrompt('');
  };

  const handleDownload = () => {
    if (imageState.processed) {
      const link = document.createElement('a');
      link.href = imageState.processed;
      link.download = `lumina-edit-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'sparkles': return <SparklesIcon />;
      case 'sun': return <SunIcon />;
      case 'wand': return <WandIcon />;
      case 'ghost': return <GhostIcon />;
      case 'zap': return <ZapIcon />;
      default: return <MagicIcon />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500 selection:text-white pb-20">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-lg">
              <MagicIcon />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              PrismaLens AI
            </h1>
          </div>
          {imageState.original && (
            <button 
              onClick={handleReset}
              className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RefreshIcon />
              <span className="hidden sm:inline">New Image</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Intro / Upload Section */}
        {!imageState.original ? (
          <div className="max-w-2xl mx-auto text-center space-y-8 mt-12">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Reimagine your photos with <span className="text-indigo-400">AI Magic</span>
              </h2>
              <p className="text-slate-400 text-lg">
                Upload a photo to start. Enhance quality, apply cinematic styles, or transform into anime art instantly.
              </p>
            </div>
            <ImageUploader onImageUpload={handleImageUpload} />
            
            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 pt-8">
              {['Studio Ghibli Art', '4K Upscaling', 'Face Refining', 'Cinematic Edits'].map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-sm border border-slate-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : (
          /* Editor Section */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Image Display */}
            <div className="lg:col-span-2 space-y-4" ref={resultRef}>
              <div className="bg-slate-800/50 rounded-2xl p-2 border border-slate-700">
                <ComparisonView 
                  original={imageState.original} 
                  processed={imageState.processed} 
                  isProcessing={imageState.isProcessing} 
                />
              </div>
              
              {/* Action Bar */}
              <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="text-sm text-slate-400">
                   {imageState.processed ? 'Drag slider to compare' : 'Select a style to begin'}
                </div>
                {imageState.processed && (
                  <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-all active:scale-95"
                  >
                    <DownloadIcon />
                    Download
                  </button>
                )}
              </div>

              {imageState.error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl text-sm">
                  <strong>Error:</strong> {imageState.error}
                </div>
              )}
            </div>

            {/* Right Column: Controls */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-slate-200">Creative Styles</h3>
                <div className="grid grid-cols-1 gap-3">
                  {PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => handleProcess(preset.id)}
                      disabled={imageState.isProcessing}
                      className={`group relative overflow-hidden rounded-xl p-4 text-left border transition-all duration-300
                        ${activeMode === preset.id 
                          ? 'border-indigo-500 bg-slate-800 ring-1 ring-indigo-500/50' 
                          : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600'
                        }
                      `}
                    >
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r ${preset.color} transition-opacity`} />
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`p-3 rounded-lg bg-slate-900 text-slate-200 group-hover:scale-110 transition-transform`}>
                          {renderIcon(preset.icon)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">{preset.label}</div>
                          <div className="text-xs text-slate-400">{preset.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-slate-200">Custom Edit</h3>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 space-y-3">
                  <div className="relative">
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="E.g., 'Make it look like a cyberpunk city', 'Remove the background'"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24"
                    />
                  </div>
                  <button
                    onClick={() => handleProcess(EditMode.CUSTOM)}
                    disabled={!customPrompt.trim() || imageState.isProcessing}
                    className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <MagicIcon />
                    Generate Custom
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;