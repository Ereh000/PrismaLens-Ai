export enum EditMode {
  GHIBLI = 'GHIBLI',
  QUALITY = 'QUALITY',
  REFINE = 'REFINE',
  BATMAN = 'BATMAN',
  POTTER = 'POTTER',
  CUSTOM = 'CUSTOM'
}

export interface PresetConfig {
  id: EditMode;
  label: string;
  description: string;
  icon: string;
  prompt: string;
  color: string;
}

export interface ImageState {
  original: string | null;
  processed: string | null;
  isProcessing: boolean;
  error: string | null;
}