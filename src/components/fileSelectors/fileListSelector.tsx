import React, { useEffect, useState } from 'react';
import { open } from '@tauri-apps/api/dialog';
import { toast } from '@/components/ui/use-toast';
import styles from './fileListSelector.module.scss';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileSelectorProps {
  value: string[],
  onChange: (files: string[]) => void
}

export default function FileListSelector({ value, onChange }: FileSelectorProps) {
  const [selectedRowIndices, setSelectedRowIndices] = useState<number[]>([]);
  const [clearDisabled, setClearEnabled] = useState<boolean>(false);
  const [removeDisabled, setRemoveEnabled] = useState<boolean>(false);

  const [files, setFiles] = useState<Set<string>>(new Set(value));
  const changeFiles = (newFiles: Set<string>) => {
    onChange(Array.from(newFiles));
    setFiles(newFiles);
  };

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
          changeFiles(newFiles);
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

      changeFiles(new Set(Array.from(newSet)));
      setSelectedRowIndices([]);
    }
  }

  function clearList() {
    changeFiles(new Set());
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
