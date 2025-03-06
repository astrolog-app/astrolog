'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Image } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import ImageRenderer from '@/components/images/imageRenderer';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';

export default function ImagePreview({ images }: { images: string[] }) {
  const [currentImage, setCurrentImage] = useState<number>(1);
  const maxImage = images.length;

  function nextImage() {
    setCurrentImage(Math.min(maxImage, currentImage + 1));
  }

  function prevImage() {
    setCurrentImage(Math.max(1, currentImage - 1));
  }

  function getLastPathSegment(path: string): string {
    return path.replace(/\\/g, '/').split('/').filter(Boolean).pop() || '';
  }

  useEffect(() => {
    setCurrentImage(1);
  }, [images]);

  return (
    <ImagePreviewBase>
      <div className="flex-1 flex flex-col">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4 flex-shrink-0">
          <ImageRenderer
            path={images[currentImage - 1] || '/placeholder.svg'}
            className="w-full h-full object-contain"
          />
        </div>

        <p className="text-center text-sm mb-4 text-foreground">
          {getLastPathSegment(images[currentImage - 1])}
        </p>

        {/* Image navigation */}
        <div className="flex justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
            disabled={currentImage === 1}
            onClick={() => prevImage()}
          >
            Previous
          </Button>
          <span className="text-sm flex items-center text-foreground">
                {currentImage} of {images.length}
              </span>
          <Button
            variant="outline"
            size="sm"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
            disabled={currentImage === images.length}
            onClick={nextImage}
          >
            Next
          </Button>
        </div>

        {/* Thumbnails */}
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-3 gap-2">
            {images.map((imageId, index) => (
              <div
                key={imageId}
                className={`aspect-square rounded-md overflow-hidden cursor-pointer border-2 ${
                  index === currentImage - 1 ? 'border-primary' : 'border-transparent'
                }`}
                onClick={() => setCurrentImage(index + 1)}
              >
                <ImageRenderer
                  path={images[index]}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </ImagePreviewBase>
  );
}

export function ImagePreviewUndefined() {
  return (
    <ImagePreviewBase>
      <div className="flex-1 flex items-center justify-center text-muted-foreground">No images available</div>
    </ImagePreviewBase>
  );
}

function ImagePreviewBase({ children }: { children: ReactNode }) {
  return (
    <Card className="bg-card border-border h-full">
      <CardContent className="p-4 h-full flex flex-col">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image className="h-5 w-5 text-primary" />
          Image Preview
        </h3>

        {children}
      </CardContent>
    </Card>
  );
}
