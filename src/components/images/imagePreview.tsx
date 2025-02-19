'use client';

import styles from './imagePreview.module.scss';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UUID } from 'crypto';
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { toast } from '@/components/ui/use-toast';
import ImageRenderer from '@/components/images/imageRenderer';

export default function ImagePreview({ selectedSessionId }: { selectedSessionId: UUID | undefined }) {
  const defaultDescription = 'Select Image';

  const [images, setImages] = useState<string[] | undefined>(undefined);
  const [currentImage, setCurrentImage] = useState<number>(0);
  const [maxImage, setMaxImage] = useState<number>(0);
  const [description, setDescription] = useState<string>(defaultDescription);

  function nextImage() {
    setCurrentImage(Math.min(maxImage, currentImage + 1));
  }

  function prevImage() {
    setCurrentImage(Math.max(0, currentImage - 1));
  }

  function getLastPathSegment(path: string): string {
    return path.replace(/\\/g, '/').split('/').filter(Boolean).pop() || '';
  }

  useEffect(() => {
    if (selectedSessionId === undefined) {
      setImages(undefined);
    } else {
      invoke<string[]>('get_image_frames_path', { id: selectedSessionId })
        .then((data) => {
          setImages(data);
          setCurrentImage(1);
          setMaxImage(data.length);
        })
        .catch((error) => {
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: 'Error: ' + error
          });
        });
    }
  }, [selectedSessionId]);

  useEffect(() => {
    if (images && images.length > 0 && currentImage > 0) {
      const image = images.at(currentImage - 1);
      if (image) {
        setDescription(getLastPathSegment(image));
        return;
      }
    }

    setDescription(defaultDescription);
  }, [currentImage, images]);

  return (
    <Card className={styles.imagePreviewCard}>
      <CardHeader>
        <CardTitle>Image Preview</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {images === undefined ? (
          <div>test</div>
        ) : (
          <ImageRenderer path={images?.at(currentImage - 1) ?? ''} />
        )}
        <div onClick={() => prevImage()}>prev</div>
        <div>{currentImage} / {maxImage}</div>
        <div onClick={() => nextImage()}>next</div>
      </CardContent>
    </Card>
  );
}
