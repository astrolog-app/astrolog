'use client';

import styles from './imagePreview.module.scss';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UUID } from 'crypto';
import { useEffect, useState } from 'react';
import ImageRenderer from '@/components/images/imageRenderer';

export default function ImagePreview({
  images,
}: {
  images: string[] | undefined;
}) {
  if (images === undefined) {
    return <div>undefined</div>;
  }
  const [currentImage, setCurrentImage] = useState<number>(0);
  const [maxImage, setMaxImage] = useState<number>(0);
  const [description, setDescription] = useState<string>(
    getLastPathSegment(images[0]),
  );

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

  }, [images]);

  return (
    <Card className={styles.imagePreviewCard}>
      <CardHeader>
        <CardTitle>Image Preview</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ImageRenderer path={images.at(0) ?? ''} />
        <div onClick={() => prevImage()}>prev</div>
        <div>
          {currentImage} / {maxImage}
        </div>
        <div onClick={() => nextImage()}>next</div>
      </CardContent>
    </Card>
  );
}
