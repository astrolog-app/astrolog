'use client';

import styles from './imageView.module.scss';
import { Card, CardHeader } from './ui/card';
import { convertFileSrc, invoke } from '@tauri-apps/api/tauri';
import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Image } from '@/interfaces/state';

interface ImageViewProps {
  className?: string;
  image: Image;
}

export default function ImageView({ className, image }: ImageViewProps) {
  const [imageSrc, setImageSrc] = useState('');

  useEffect((() => {
    setImageSrc(convertFileSrc(image.path));
  }), [image]);

  function onClick() {
    invoke('open_image', { path: image.path })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'Error: ' + error
        });
      });
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className={styles.title}>{image.title}</div>
        <img loading="lazy" src={imageSrc} className={styles.image} onClick={onClick} alt="load" />
      </CardHeader>
    </Card>
  );
}
