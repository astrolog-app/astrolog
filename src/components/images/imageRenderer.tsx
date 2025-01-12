'use client';

import { convertFileSrc } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';
import { Image } from '@/interfaces/state';

interface ImageRendererProps {
  className?: string;
  image: Image;
  onClick?: () => void;
}

export default function ImageRenderer({ className, image, onClick }: ImageRendererProps) {
  const [imageSrc, setImageSrc] = useState('');

  useEffect((() => {
    setImageSrc(convertFileSrc(image.path));
  }), [image]);

  return (
    <img loading="lazy" src={imageSrc} className={className} onClick={onClick} alt="load" />
  );
}
