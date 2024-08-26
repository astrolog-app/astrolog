'use client';

import { Modal } from '@/components/ui/custom/modal';
import styles from './newImage.module.scss';
import OptionInput, { ChangeButton } from '@/components/ui/custom/optionInput';
import { useState } from 'react';
import { DialogFilter } from '@tauri-apps/api/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Image } from '@/context/stateProvider';
import { invoke } from '@tauri-apps/api/tauri';
import { toast } from '@/components/ui/use-toast';

interface NewImageProps {
  onClose: () => void;
  defaultValue: string;
  dialogFilters: DialogFilter[];
}

const formSchema = z.object({
  path: z.string().min(2, {
    message: 'Username must be at least 2 characters.' // change
  }),
  title: z.string().min(2, {
    message: 'Username must be at least 2 characters.' // change
  }),
});

export default function NewImage({ onClose, defaultValue, dialogFilters }: NewImageProps) {
  const [path, setPath] = useState<string>(defaultValue);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      path: defaultValue,
      title: '',
    }
  });

  async function onSubmit() {
    const newImage: Image = {
      path: form.getValues().path,
      title: form.getValues().title,
      total_exposure: 0
    }

    if (await invoke("add_new_image", { image: newImage })) {
      toast({
        description: "Success"
      })
      onClose();
    } else {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      })
    }
  }

  return (
    <Modal
      onClose={onClose}
      title="Add Image"
      separator
      className={styles.modal}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
          <FormField
            control={form.control}
            name="path"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Path
                </FormLabel>
                <FormControl>
                  <OptionInput
                    value={path}
                    disabled
                  >
                    <ChangeButton
                      saveAction={(value) => {
                        setPath(value);
                      }}
                      path=""
                      filters={dialogFilters}
                    />
                  </OptionInput>
                </FormControl>
                <FormDescription>
                  The path of the new Image.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Title
                </FormLabel>
                <FormControl>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormControl>
                <FormDescription>
                  The title of your image (e.g. target name).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className={styles.button} type="submit">Add Image</Button>
        </form>
      </Form>
    </Modal>
  );
}