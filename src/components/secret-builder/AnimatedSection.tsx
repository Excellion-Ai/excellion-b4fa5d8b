import React from 'react';
import { cn } from '@/lib/utils';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import type { AnimationConfig } from '@/types/site-spec';
import { getAnimationClass, getAnimationStyle } from './AnimationPicker';

interface AnimatedSectionProps {
  children: React.ReactNode;
  animation?: AnimationConfig;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

export function AnimatedSection({ 
  children, 
  animation, 
  className, 
  style,
  id 
}: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation({ 
    threshold: 0.1,
    triggerOnce: true 
  });

  // No animation configured
  if (!animation || animation.type === 'none') {
    return (
      <div id={id} className={className} style={style}>
        {children}
      </div>
    );
  }

  const animationClass = getAnimationClass(animation);
  const animationStyle = getAnimationStyle(animation);

  // Load trigger - animate immediately
  if (animation.trigger === 'load') {
    return (
      <div 
        id={id}
        className={cn(className, animationClass)} 
        style={{ ...style, ...animationStyle }}
      >
        {children}
      </div>
    );
  }

  // Scroll trigger - animate when visible
  if (animation.trigger === 'scroll') {
    return (
      <div
        id={id}
        ref={ref}
        className={cn(
          className,
          'animate-on-scroll',
          isVisible && animationClass,
          isVisible && 'is-visible'
        )}
        style={{
          ...style,
          ...(isVisible ? animationStyle : {}),
        }}
      >
        {children}
      </div>
    );
  }

  // Hover trigger - animate on hover
  if (animation.trigger === 'hover') {
    return (
      <div 
        id={id}
        className={cn(className, 'animate-on-hover group')} 
        style={style}
      >
        <div 
          className={cn('animate-target', animationClass)}
          style={animationStyle}
        >
          {children}
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div id={id} className={className} style={style}>
      {children}
    </div>
  );
}
