'use client';

import styles from './imageGallery.module.scss';
import { useAppState } from '@/context/stateProvider';
import { Card, CardHeader } from '@/components/ui/card';
import ImageRenderer from '@/components/images/imageRenderer';
import { invoke } from '@tauri-apps/api/core';
import { toast } from '@/components/ui/use-toast';

interface ImageGalleryProps {
  columns: number;
}

export default function ImageGallery({ columns }: ImageGalleryProps) {
  const { appState } = useAppState();

  function onClick(path: string) {
    invoke('open_image', { path: path })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'Error: ' + error
        });
      });
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 'var(--padding)'
      }}
    >
      {appState.image_list.map((image, index) => (
        <Card className={styles.imageView}
              key={index}>
          <CardHeader>
            <div className={styles.title}>{image.title}</div>
            <ImageRenderer className={styles.image} path={image.path} onClick={() => onClick(image.path)} />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
