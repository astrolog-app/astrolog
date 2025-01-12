'use client';

import styles from './imageGallery.module.scss';
import { useAppState } from '@/context/stateProvider';
import ImageGalleryView from '@/components/images/imageGalleryView';

interface ImageGalleryProps {
  columns: number;
}

export default function ImageGallery({ columns }: ImageGalleryProps) {
  const { appState } = useAppState();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 'var(--padding)'
      }}
    >
      {appState.image_list.map((image, index) => (
        <ImageGalleryView
          key={index}
          className={styles.imageView}
          image={image}
        />
      ))}
    </div>
  );
}
