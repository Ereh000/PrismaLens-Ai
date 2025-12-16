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
    <div className="w-full h-64 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center bg-slate-800/50 hover:bg-slate-800/80 transition-all cursor-pointer relative group">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="p-4 rounded-full bg-indigo-500/20 text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
        <UploadIcon />
      </div>
      <p className="text-slate-300 font-medium text-lg">Click to upload or drag & drop</p>
      <p className="text-slate-500 text-sm mt-2">Supports JPG, PNG, WEBP</p>
    </div>
  );
};

export default ImageUploader;