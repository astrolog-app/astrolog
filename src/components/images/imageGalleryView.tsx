'use client';

import styles from './imageGalleryView.module.scss';
import ImageRenderer from '@/components/images/imageRenderer';
import { Image } from '@/interfaces/state';
import { invoke } from '@tauri-apps/api/core';
import { toast } from '@/components/ui/use-toast';
import { Card, CardHeader } from '@/components/ui/card';

interface ImageGalleryViewProps {
  className?: string;
  image: Image;
}

export default function ImageGalleryView({ className, image }: ImageGalleryViewProps) {
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
        <ImageRenderer className={styles.image} path={image.path} onClick={onClick} />
      </CardHeader>
    </Card>
  );
}
