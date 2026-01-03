import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { detectNiche } from '@/lib/motion/motionEngine';
import { Niche } from '@/lib/motion/types';

type ImageType = 'hero' | 'service' | 'team' | 'gallery' | 'testimonial' | 'about' | 'contact' | 'product' | 'feature';

interface GenerateImageOptions {
  businessName: string;
  businessDescription?: string;
  niche?: Niche;
  imageType?: ImageType;
  customPrompt?: string;
  count?: number;
}

interface GeneratedImage {
  url: string;
  type: ImageType;
  niche: Niche;
}

export function useNicheImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const generateImage = useCallback(async (options: GenerateImageOptions): Promise<string | null> => {
    const { businessName, businessDescription, niche, imageType = 'hero', customPrompt, count = 1 } = options;
    
    setIsGenerating(true);
    setProgress(10);

    try {
      // Auto-detect niche if not provided
      const detectedNiche = niche || detectNiche({ 
        businessName, 
        description: businessDescription 
      });

      setProgress(30);

      const { data, error } = await supabase.functions.invoke('generate-niche-image', {
        body: {
          businessName,
          businessDescription,
          niche: detectedNiche,
          imageType,
          customPrompt,
          count
        }
      });

      setProgress(90);

      if (error) {
        console.error('Image generation error:', error);
        
        if (error.message?.includes('429') || error.message?.includes('rate limit')) {
          toast.error('Rate limit reached. Please wait a moment and try again.');
        } else if (error.message?.includes('402') || error.message?.includes('payment')) {
          toast.error('Credits exhausted. Please add more credits to continue.');
        } else {
          toast.error('Failed to generate image. Using placeholder.');
        }
        return null;
      }

      if (data?.images?.length > 0) {
        const newImages = data.images.map((url: string) => ({
          url,
          type: imageType,
          niche: detectedNiche
        }));
        setGeneratedImages(prev => [...prev, ...newImages]);
        setProgress(100);
        return data.images[0];
      }

      if (data?.imageUrl) {
        setGeneratedImages(prev => [...prev, {
          url: data.imageUrl,
          type: imageType,
          niche: detectedNiche
        }]);
        setProgress(100);
        return data.imageUrl;
      }

      return null;
    } catch (err) {
      console.error('Image generation failed:', err);
      toast.error('Image generation failed');
      return null;
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, []);

  const generateMultipleImages = useCallback(async (
    businessName: string,
    businessDescription: string,
    imageTypes: ImageType[]
  ): Promise<Record<ImageType, string | null>> => {
    const results: Record<string, string | null> = {};
    
    const detectedNiche = detectNiche({ 
      businessName, 
      description: businessDescription 
    });

    setIsGenerating(true);
    
    for (let i = 0; i < imageTypes.length; i++) {
      const imageType = imageTypes[i];
      setProgress(Math.round((i / imageTypes.length) * 100));
      
      const imageUrl = await generateImage({
        businessName,
        businessDescription,
        niche: detectedNiche,
        imageType
      });
      
      results[imageType] = imageUrl;
      
      // Small delay between requests to avoid rate limiting
      if (i < imageTypes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    setIsGenerating(false);
    setProgress(100);
    
    return results as Record<ImageType, string | null>;
  }, [generateImage]);

  const clearGeneratedImages = useCallback(() => {
    setGeneratedImages([]);
  }, []);

  return {
    generateImage,
    generateMultipleImages,
    isGenerating,
    progress,
    generatedImages,
    clearGeneratedImages
  };
}
