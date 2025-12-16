import React, { useCallback } from 'react';
import { UploadIcon } from './Icons';

interface ImageUploaderProps {
  onImageUpload: (base64: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onImageUpload(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  return (
    <div className="w-full h-64 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all cursor-pointer relative group">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
        <UploadIcon />
      </div>
      <p className="text-zinc-700 dark:text-zinc-300 font-medium text-lg">Click to upload or drag & drop</p>
      <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-2">Supports JPG, PNG, WEBP</p>
    </div>
  );
};

export default ImageUploader;