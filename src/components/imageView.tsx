'use client'

import styles from './imageView.module.scss';
import { Card, CardHeader } from './ui/card';
import { invoke } from '@tauri-apps/api/tauri';
import { Image } from '@/context/stateProvider';
import { useEffect, useState } from 'react';

interface ImageViewProps {
  className?: string;
  image: Image;
}

export default function ImageView({ className, image }: ImageViewProps) {
  const [imageSrc, setImageSrc] = useState("");

  useEffect((() => {
    const loadImage = async () => {
      try {
        // Replace with your image path
        const filePath = image.path;

        // Invoke the Tauri command
        const base64Image = await invoke("show_image", { filePath });

        // Set the base64 string as the image source
        setImageSrc(`data:image/png;base64,${base64Image}`);
      } catch (error) {
        console.error("Failed to load image:", error);
      }
    };

    loadImage();
  }), []);

  return (
    <Card className={className}>
      <CardHeader>
        <div className={styles.title}>{image.title}</div>
        <img src={imageSrc} className={styles.image} onClick={ async () => { await invoke("open_image", { path: image.path}) }} />
      </CardHeader>
    </Card>
  );
}
