'use client';

import { convertFileSrc } from '@tauri-apps/api/core';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/utils/classNames';

interface ImageRendererProps {
  className?: string;
  path: string;
  onClick?: () => void;
}

export default function ImageRenderer({ className, path, onClick }: ImageRendererProps) {
  const [imageSrc, setImageSrc] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      try {
        const src = convertFileSrc(path);
        if (isMounted) {
          setImageSrc(src);
        }
      } catch (error) {
        console.error('Error loading image:', error);
      }
    };

    void loadImage();

    return () => {
      isMounted = false;
    };
  }, [path]);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  // TODO: finish
  return (
    <div className={`image-container ${className || ''}`}>
      {!isLoaded && <div className="placeholder">Loading...</div>}
      {imageSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={imageSrc}
          className={cn(className, `image ${isLoaded ? 'loaded' : 'loading'}`)}
          onClick={onClick}
          alt="load"
          onLoad={handleImageLoad}
          style={{ display: isLoaded ? 'block' : 'none' }}
        />
      )}
    </div>
  );
}
