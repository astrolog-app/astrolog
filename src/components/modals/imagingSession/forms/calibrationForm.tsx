'use client';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import React from 'react';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './calibrationForm.module.scss';
import { Button } from '@/components/ui/button';
import { useModal } from '@/context/modalProvider';

const formSchema = z.object({
  target: z.string().min(2, {
    message: 'Username must be at least 2 characters.', // change
  }),
});

export default function CalibrationForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      target: '',
    },
  });

  const { closeModal } = useModal();

  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="target"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Root Directory</FormLabel>
              <FormControl>
                <Input />
              </FormControl>
              <FormDescription>
                The directory in your filesystem where all of your astrophotos
                are
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className={styles.buttons}>
          <Button
            type="button"
            variant="secondary"
            onClick={closeModal}
            className={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button type="submit">Next</Button>
        </div>
      </form>
    </Form>
  );
}
