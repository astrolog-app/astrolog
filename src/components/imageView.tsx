'use client'

import styles from './imageView.module.scss';
import { Card, CardHeader } from './ui/card';
import { invoke } from '@tauri-apps/api/tauri';
import { Image } from '@/context/stateProvider';

interface ImageViewProps {
  className?: string;
  image: Image;
}

export default function ImageView({ className, image }: ImageViewProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className={styles.title}>{image.title}</div>
        <div className={styles.image} onClick={ async () => { await invoke("open_image", { path: image.path}) }} />
      </CardHeader>
    </Card>
  );
}
