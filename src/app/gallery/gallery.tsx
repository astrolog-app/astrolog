'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tab } from '@/components/ui/custom/tab';
import styles from './gallery.module.scss';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import NewImage from '@/components/modals/newImage/newImage';
import { open } from '@tauri-apps/plugin-dialog';
import { toast } from '@/components/ui/use-toast';
import { useAppState } from '@/context/stateProvider';
import { useModal } from '@/context/modalProvider';
import ImageGallery from '@/components/images/imageGallery';

export default function Gallery() {
  const { appState } = useAppState();
  const { openModal } = useModal();

  const [windowWidth, setWindowWidth] = useState<number>(2560);
  const [columns, setColumns] = useState<number>(3);
  const [newImagePath, setNewImagePath] = useState<string>('');

  const dialogFilters = [
    {
      name: 'all',
      extensions: ['png', 'jpeg']
    },
    {
      name: '.png',
      extensions: ['png']
    },
    {
      name: '.jpeg',
      extensions: ['jpeg']
    }
  ];

  function addNewImage() {
    open({
      multiple: false,
      filters: dialogFilters
    })
      .then((selectedPath) => {
        if (selectedPath) {
          setNewImagePath(selectedPath as string);
          console.log(newImagePath);
          openModal(<NewImage defaultValue={newImagePath} dialogFilters={dialogFilters} />);
        }
      })
      .catch((err) => {
        toast({
          variant: 'destructive',
          description: 'Failed to open Image: ' + err
        });
        console.log(err);
      });
  }

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
          <Button variant="secondary" onClick={addNewImage}>
            Add Image
          </Button>
        </CardContent>
      </Card>
      <ImageGallery columns={columns} />
    </Tab>
  );
}
