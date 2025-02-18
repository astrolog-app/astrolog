'use client';

import styles from './newImagingSessionGeneral.module.scss';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TabKey } from '@/components/modals/newImagingSession/newImagingSession';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/utils/classNames';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { invoke } from '@tauri-apps/api/core';
import { useModal } from '@/context/modalProvider';
import { generalImagingSessionSchema } from '@/schemas/imagingSessionSchema';

export default function NewImagingSessionGeneral({
  setSelectedTab,
}: {
  setSelectedTab: React.Dispatch<React.SetStateAction<TabKey | undefined>>;
}) {
  const form = useForm<z.infer<typeof generalImagingSessionSchema>>({
    resolver: zodResolver(generalImagingSessionSchema),
    defaultValues: {
      target: '',
    },
  });

  const { closeModal } = useModal();

  function onSubmit() {
    setSelectedTab('equipment');
  }

  useEffect(() => {
    invoke('get_date', {
      image:
        'E:\\Astrof\\DATA\\2022\\M 42\\Orion UK 200 mm\\27.12\\2\\Light\\L_m42_0164_ISO800_10s__NA.NEF',
    }).then((date) => form.setValue('date', new Date(date as Date)));
  }, [form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.general}>
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Acquisition Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-[240px] pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription className="w-[240px]">
                  The date you took your imaging frames.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="target"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Target</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="NGC 9999" />
                </FormControl>
                <FormDescription>
                  The name of the target (e.g. NGC 7000).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
