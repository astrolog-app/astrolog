'use client';

import styles from './newImagingSession.module.scss';
import { Modal } from '@/components/ui/custom/modal';
import React, { useEffect, useState } from 'react';
import NewImagingSessionCalibration from '@/components/modals/newImagingSession/newImagingSessionCalibration';
import NewImagingSessionEquipment from '@/components/modals/newImagingSession/newImagingSessionEquipment';
import NewImagingSessionGeneral from '@/components/modals/newImagingSession/newImagingSessionGeneral';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { open } from '@tauri-apps/api/dialog';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const tabKeys = ['general', 'equipment', 'calibration'] as const;
export type TabKey = typeof tabKeys[number];

export default function NewImagingSession(
  {
    onClose
  }: {
    onClose: () => void;
  }) {
  const [selectedTab, setSelectedTab] = useState<TabKey>();

  function renderTab(): React.ReactNode {
    switch (selectedTab) {
      case 'general':
        return <NewImagingSessionGeneral setSelectedTab={setSelectedTab} />;
      case 'equipment':
        return <NewImagingSessionEquipment />;
      case 'calibration':
        return <NewImagingSessionCalibration />;
      default:
        return <SelectLightFrames setSelectedTab={setSelectedTab} />;
    }
  }

  return (
    <Modal
      onClose={onClose}
      title="Add Imaging Session"
      separator
      className={styles.modal}
    >
      {renderTab()}
    </Modal>
  );
}

const formSchema = z.object({
  target: z.string().min(2, {
    message: 'Username must be at least 2 characters.' // change
  })
});

function SelectLightFrames({ setSelectedTab }: {
  setSelectedTab: React.Dispatch<React.SetStateAction<TabKey | undefined>>
}) {
  const [selectedFrames, setSelectedFrames] = useState<Set<string>>(new Set);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      target: ''
    }
  });

  function onSubmit() {
    setSelectedTab('general');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="target"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Light Frames</FormLabel>
              <FormDescription>
                The light frames of your new imaging session.
              </FormDescription>
              <FormControl>
                <FileSelector files={selectedFrames} setFiles={setSelectedFrames} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className={styles.nextButton} type="submit">Next</Button>
      </form>
    </Form>
  );
}

interface FileSelectorProps {
  files: Set<string>;
  setFiles: React.Dispatch<React.SetStateAction<Set<string>>>;
}

function FileSelector({ files, setFiles }: FileSelectorProps) {
  const [selectedRowIndices, setSelectedRowIndices] = useState<number[]>([]);
  const [clearDisabled, setClearEnabled] = useState<boolean>(false);
  const [removeDisabled, setRemoveEnabled] = useState<boolean>(false);

  useEffect(() => {
    setClearEnabled(files.size === 0);
  }, [files]);

  useEffect(() => {
    setRemoveEnabled(selectedRowIndices.length === 0);
  }, [selectedRowIndices]);

  function onClick() {
    open({
      multiple: true
    })
      .then((selectedFiles) => {
        if (selectedFiles) {
          let newFiles = new Set(files);
          if (typeof selectedFiles === 'string') {
            newFiles.add(selectedFiles);
          } else {
            selectedFiles.forEach((file) => newFiles.add(file));
          }
          setFiles(newFiles);
        }
      })
      .catch((err) => {
        toast({
          variant: 'destructive',
          description: 'Failed to open files: ' + err
        });
        console.error(err);
      });
  }

  function rowClick(index: number, event: React.MouseEvent) {
    const selectedRows = selectedRowIndices;

    const lastSelectedIndex = selectedRowIndices[selectedRowIndices.length - 1];
    const start = Math.min(lastSelectedIndex, index);
    const end = Math.max(lastSelectedIndex, index);
    const newSelectedIndices: number[] = [];

    switch (true) {
      case event.shiftKey:
        for (let i = start; i <= end; i++) {
          if (!selectedRowIndices.includes(i)) {
            newSelectedIndices.push(i);
          }
        }

        setSelectedRowIndices((prevSelectedIndices) => [
          ...prevSelectedIndices,
          ...newSelectedIndices
        ]);
        break;
      case event.ctrlKey:
        if (selectedRows.includes(index)) {
          setSelectedRowIndices(selectedRows.filter((e) => e !== index));
        } else {
          setSelectedRowIndices((prevSelectedIndices) => [
            ...prevSelectedIndices,
            index
          ]);
        }
        break;
      default:
        setSelectedRowIndices([index]);
        if (selectedRows.includes(index) && selectedRows.length === 1) {
          setSelectedRowIndices([]);
        }
        break;
    }
  }

  function removeItems(indices: number[]) {
    if (indices.length > 0) {
      const newSet = new Set(files);
      const filesArray = Array.from(files);

      indices.forEach(index => {
        newSet.delete(filesArray[index]);
      });

      setFiles(new Set(Array.from(newSet)));
      setSelectedRowIndices([]);
    }
  }

  function clearList() {
    setFiles(new Set());
    setSelectedRowIndices([]);
  }

  return (
    <div className={styles.fileSelector}>
      <div className={styles.left}>
        <div className={styles.rowWrapper}>
          {Array.from(files).map((file, index) => (
            <div
              onClick={(event) => rowClick(index, event)}
              className={cn(styles.row, selectedRowIndices.includes(index) ? styles.selected : '')}
              key={index}
            >
              {file}
            </div>
          ))}
        </div>
        {files.size === 0 && (
          <div className={styles.noFiles}>No Files Selected.</div>
        )}
      </div>
      <div className={styles.right}>
        <Button type="button" onClick={onClick} variant="secondary">Add...</Button>
        <Button type="button" onClick={() => removeItems(selectedRowIndices)} variant="outline"
                disabled={removeDisabled}>Remove</Button>
        <Button type="button" onClick={clearList} variant="outline" disabled={clearDisabled}>Clear</Button>
      </div>
    </div>
  );
}
