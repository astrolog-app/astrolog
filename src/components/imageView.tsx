'use client';

import styles from './imageView.module.scss';
import { Card, CardHeader } from './ui/card';
import { convertFileSrc, invoke } from '@tauri-apps/api/tauri';
import { Image } from '@/context/stateProvider';
import { useEffect, useState } from 'react';

interface ImageViewProps {
  className?: string;
  image: Image;
}

export default function ImageView({ className, image }: ImageViewProps) {
  const [imageSrc, setImageSrc] = useState('');

  useEffect((() => {
    setImageSrc(convertFileSrc(image.path));
  }), [image]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className={styles.title}>{image.title}</div>
        <img src={imageSrc} className={styles.image} onClick={async () => {
          await invoke('open_image', { path: image.path });
        }}  alt="load"/>
      </CardHeader>
    </Card>
  );
}
