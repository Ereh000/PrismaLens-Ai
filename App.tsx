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
  MoonIcon,
  GhostIcon, 
  ZapIcon,
  DownloadIcon,
  RefreshIcon
} from './components/Icons';

const PRESETS: PresetConfig[] = [
  {
    id: EditMode.GHIBLI,
    label: 'Ghibli Style',
    description: 'Anime art transformation',
    icon: 'sparkles',
    color: 'text-emerald-500',
    prompt: 'Transform this image into a high-quality Studio Ghibli style anime scene. Maintain the composition and key subjects but render them with the signature vibrant colors, fluffy clouds, and hand-drawn aesthetic of Ghibli movies.'
  },
  {
    id: EditMode.QUALITY,
    label: 'Enhance',
    description: 'Boost clarity & detail',
    icon: 'sun',
    color: 'text-blue-500',
    prompt: 'Significantly enhance the quality of this image. Increase resolution, sharpness, and clarity. Remove noise and artifacts. Make it look like a professional high-definition photograph.'
  },
  {
    id: EditMode.REFINE,
    label: 'Refine Face',
    description: 'Smooth & beautify',
    icon: 'wand',
    color: 'text-pink-500',
    prompt: 'Retouch the facial features in this image. Smooth the skin naturally while preserving texture and details. Enhance lighting on the face for a professional portrait look.'
  },
  {
    id: EditMode.BATMAN,
    label: 'Gotham City',
    description: 'Dark cinematic look',
    icon: 'ghost',
    color: 'text-zinc-500',
    prompt: 'Apply a dark, gritty, cinematic Batman-style aesthetic to this image. High contrast, shadows, rain effects if appropriate, cool color temperature, and a dramatic, brooding atmosphere.'
  },
  {
    id: EditMode.POTTER,
    label: 'Wizard World',
    description: 'Magical effects',
    icon: 'zap',
    color: 'text-amber-500',
    prompt: 'Transform this image with a Harry Potter wizarding world aesthetic. Add magical glows, floating particles, vintage coloring, and a mysterious, enchanted atmosphere.'
  },
];

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [imageState, setImageState] = useState<ImageState>({
    original: null,
    processed: null,
    isProcessing: false,
    error: null,
  });

  const [activeMode, setActiveMode] = useState<EditMode | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

  // Initialize theme from local storage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  // Update HTML class when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

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
      link.download = `prismalens-edit-${Date.now()}.png`;
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
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <MagicIcon />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              PrismaLens<span className="text-indigo-600 dark:text-indigo-400">AI</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {imageState.original && (
              <button 
                onClick={handleReset}
                className="hidden sm:flex text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 items-center gap-1.5 transition-colors px-3 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <RefreshIcon />
                New Image
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
        
        {/* Intro / Upload Section */}
        {!imageState.original ? (
          <div className="max-w-2xl mx-auto text-center space-y-10 mt-8 md:mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 lg:text-6xl">
                Refine reality with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">AI Magic</span>
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
                Upload a photo to instantly enhance quality, apply cinematic color grades, or transform into unique art styles.
              </p>
            </div>
            
            <div className="w-full">
               <ImageUploader onImageUpload={handleImageUpload} />
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {['Studio Ghibli', '4K Upscale', 'Face Refining', 'Cyberpunk', 'Cinematic'].map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-xs font-medium border border-zinc-200 dark:border-zinc-800">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : (
          /* Editor Section */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in zoom-in-95 duration-500">
            
            {/* Left Column: Image Display */}
            <div className="lg:col-span-8 space-y-4 sticky top-24" ref={resultRef}>
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-1 shadow-sm">
                <ComparisonView 
                  original={imageState.original} 
                  processed={imageState.processed} 
                  isProcessing={imageState.isProcessing} 
                />
              </div>
              
              {/* Action Bar */}
              <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                   {imageState.processed ? 'Drag slider to compare results' : 'Select a style from the right to begin'}
                </div>
                <div className="flex gap-2">
                   {/* Mobile reset button */}
                   <button 
                      onClick={handleReset}
                      className="sm:hidden flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <RefreshIcon />
                    </button>
                    {imageState.processed && (
                      <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-4 py-2 rounded-md font-medium text-sm transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
                      >
                        <DownloadIcon />
                        Download
                      </button>
                    )}
                </div>
              </div>

              {imageState.error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium">
                  <strong>Error:</strong> {imageState.error}
                </div>
              )}
            </div>

            {/* Right Column: Controls */}
            <div className="lg:col-span-4 space-y-8">
              <div>
                <h3 className="text-sm font-semibold mb-4 text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Presets</h3>
                <div className="grid grid-cols-1 gap-3">
                  {PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => handleProcess(preset.id)}
                      disabled={imageState.isProcessing}
                      className={`group relative overflow-hidden rounded-lg p-3 text-left border transition-all duration-200 hover:shadow-md
                        ${activeMode === preset.id 
                          ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 ring-1 ring-indigo-600/20' 
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 ${preset.color} transition-colors group-hover:bg-white dark:group-hover:bg-zinc-700`}>
                          {renderIcon(preset.icon)}
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{preset.label}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{preset.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt */}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Custom</h3>
                <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
                  <div className="relative">
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Describe your edit..."
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-24 transition-all"
                    />
                  </div>
                  <button
                    onClick={() => handleProcess(EditMode.CUSTOM)}
                    disabled={!customPrompt.trim() || imageState.isProcessing}
                    className="w-full bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed py-2.5 rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
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