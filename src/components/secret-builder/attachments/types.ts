export interface AttachmentItem {
  id: string;
  type: 'file' | 'text' | 'link' | 'screenshot' | 'brandkit';
  name: string;
  data?: string | File;
  mimeType?: string;
  url?: string;
  brandKit?: BrandKit;
}

export interface BrandKit {
  logo?: string; // base64 or URL
  primaryColor: string;
  secondaryColor: string;
  font: 'inter' | 'manrope' | 'system';
  tone: 'professional' | 'bold' | 'minimal' | 'playful';
}

export const FONT_OPTIONS = [
  { value: 'inter', label: 'Inter' },
  { value: 'manrope', label: 'Manrope' },
  { value: 'system', label: 'System' },
] as const;

export const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'bold', label: 'Bold' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'playful', label: 'Playful' },
] as const;
