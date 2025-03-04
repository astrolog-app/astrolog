'use client';

import { Tab } from '@/components/ui/custom/tab';
import styles from './gallery.module.scss';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import NewImage from '@/components/modals/newImage/newImage';
import { open } from '@tauri-apps/plugin-dialog';
import { toast } from '@/components/ui/use-toast';
import { useModal } from '@/context/modalProvider';
import ImageGallery from '@/components/images/imageGallery';
import HeaderCard from '@/components/headerCard';
import { Plus } from 'lucide-react';

export default function Gallery() {
  const { openModal } = useModal();

  const [windowWidth, setWindowWidth] = useState<number>(2560);
  const [columns, setColumns] = useState<number>(3);
  const [newImagePath, setNewImagePath] = useState<string>('');

  const dialogFilters = [
    {
      name: 'all',
      extensions: ['png', 'jpeg'],
    },
    {
      name: '.png',
      extensions: ['png'],
    },
    {
      name: '.jpeg',
      extensions: ['jpeg'],
    },
  ];

  function addNewImage() {
    open({
      multiple: false,
      filters: dialogFilters,
    })
      .then((selectedPath) => {
        if (selectedPath) {
          setNewImagePath(selectedPath as string);
          console.log(newImagePath);
          openModal(
            <NewImage
              defaultValue={newImagePath}
              dialogFilters={dialogFilters}
            />,
          );
        }
      })
      .catch((err) => {
        toast({
          variant: 'destructive',
          description: 'Failed to open Image: ' + err,
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
      <HeaderCard
        title="Gallery"
        subtitle="View your processed astrophotos."
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={addNewImage}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </HeaderCard>
      <ImageGallery columns={columns} />
    </Tab>
  );
}
