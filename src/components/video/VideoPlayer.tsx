import { useMemo } from 'react';
import { Play, Film } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  className?: string;
}

type VideoType = 'youtube' | 'vimeo' | 'mp4' | 'unknown';

function detectVideoType(url: string): VideoType {
  if (!url) return 'unknown';
  
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'youtube';
  }
  if (lowerUrl.includes('vimeo.com')) {
    return 'vimeo';
  }
  if (lowerUrl.endsWith('.mp4') || lowerUrl.includes('.mp4?')) {
    return 'mp4';
  }
  
  return 'unknown';
}

function extractYouTubeId(url: string): string | null {
  // Handle youtube.com/watch?v=XXXXX
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  
  // Handle youtu.be/XXXXX
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return shortMatch[1];
  
  // Handle youtube.com/embed/XXXXX
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
  if (embedMatch) return embedMatch[1];
  
  return null;
}

function extractVimeoId(url: string): string | null {
  // Handle vimeo.com/123456
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

export function VideoPlayer({ url, className = '' }: VideoPlayerProps) {
  const videoType = useMemo(() => detectVideoType(url), [url]);
  
  if (!url || videoType === 'unknown') {
    return (
      <div className={`aspect-video rounded-lg bg-muted/50 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Film className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Invalid or unsupported video URL</p>
        </div>
      </div>
    );
  }

  if (videoType === 'youtube') {
    const videoId = extractYouTubeId(url);
    if (!videoId) {
      return (
        <div className={`aspect-video rounded-lg bg-muted/50 flex items-center justify-center ${className}`}>
          <p className="text-muted-foreground text-sm">Could not extract YouTube video ID</p>
        </div>
      );
    }
    
    return (
      <div className={`aspect-video rounded-lg overflow-hidden bg-black ${className}`}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video player"
        />
      </div>
    );
  }

  if (videoType === 'vimeo') {
    const videoId = extractVimeoId(url);
    if (!videoId) {
      return (
        <div className={`aspect-video rounded-lg bg-muted/50 flex items-center justify-center ${className}`}>
          <p className="text-muted-foreground text-sm">Could not extract Vimeo video ID</p>
        </div>
      );
    }
    
    return (
      <div className={`aspect-video rounded-lg overflow-hidden bg-black ${className}`}>
        <iframe
          src={`https://player.vimeo.com/video/${videoId}`}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Vimeo video player"
        />
      </div>
    );
  }

  if (videoType === 'mp4') {
    return (
      <div className={`aspect-video rounded-lg overflow-hidden bg-black ${className}`}>
        <video
          src={url}
          className="w-full h-full"
          controls
          playsInline
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return null;
}

// Export utility for detecting video type
export { detectVideoType, extractYouTubeId, extractVimeoId };
export type { VideoType };
