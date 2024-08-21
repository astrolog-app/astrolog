'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tab } from '@/components/ui/custom/tab';
import styles from './gallery.module.scss';
import ImageView from '@/components/imageView';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface ImageView {
  title: string;
}

const data: ImageView[] = [
  { title: '1' },
  { title: '2' },
  { title: '3' },
  { title: '4' },
  { title: '5' },
  { title: '6' },
  { title: '7' },
  { title: '8' },
  { title: '9' },
  { title: '10' },
];

export default function Gallery() {
  const [windowWidth, setWindowWidth] = useState<number>(2560);
  const [columns, setColumns] = useState<number>(3);

  useEffect(() => {
    // Function to update the state with the current window width
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Add event listener to update window width on resize
    window.addEventListener('resize', handleResize);

    // Call the function to set the initial window width
    handleResize();

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    setColumns(Math.round(windowWidth / 600));
  }, [windowWidth]);

  return (
    <Tab>
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>Gallery</CardTitle>
          <CardDescription>View your processed astrophotos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="secondary" onClick={() => {}}>
            Add Image
          </Button>
        </CardContent>
      </Card>
      <div
        className={styles.content}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 'var(--padding)',
        }}
      >
        {data.map((image, index) => (
          <ImageView
            key={index}
            className={styles.imageView}
            title={image.title}
          />
        ))}
      </div>
    </Tab>
  );
}
