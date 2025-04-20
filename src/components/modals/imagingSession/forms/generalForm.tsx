'use client';

import styles from './generalForm.module.scss';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/utils/classNames';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { invoke } from '@tauri-apps/api/core';
import { ImagingSessionGeneralSchema } from '@/schemas/imagingSessionSchema';
import { TabKey } from '@/components/modals/imagingSession/imagingSessionEditor';
import { ImagingSessionGeneral } from '@/interfaces/imagingSessionEdit';
import { ButtonBar } from '@/components/ui/custom/modal';
import { LocationComboBox } from '@/components/ui/comboBox';
import { UUID } from 'crypto';

interface GeneralFormFormProps {
  setTab: Dispatch<SetStateAction<TabKey>>
  isEdit: boolean,
  setGeneral: Dispatch<SetStateAction<ImagingSessionGeneral | undefined>>,
  editSession: () => void,
}

export default function GeneralForm({ setTab, isEdit, setGeneral, editSession }: GeneralFormFormProps) {
  const form = useForm<z.infer<typeof ImagingSessionGeneralSchema>>({
    resolver: zodResolver(ImagingSessionGeneralSchema),
    defaultValues: {
      target: ''
    }
  });

  function onSubmit() {
    if (isEdit) {
      // TODO
      editSession();
      return;
    }

    const values = form.getValues();
    const general: ImagingSessionGeneral = {
      date: values.date,
      target: values.target,
      location_id: values.location as UUID
    };
    setGeneral(general);
    setTab('details');
  }

  useEffect(() => {
    invoke('get_date', {
      image:
        'E:\\Astrof\\DATA\\2022\\M 42\\Orion UK 200 mm\\27.12\\2\\Light\\L_m42_0164_ISO800_10s__NA.NEF'
    }).then((date) => form.setValue('date', new Date(date as Date)));
  }, [form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
        {/* First row with Date and Target side by side */}
        <div className="flex flex-col md:flex-row gap-4 w-full mb-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col flex-1">
                <FormLabel>Acquisition Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>The date you took your imaging frames.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target"
            render={({ field }) => (
              <FormItem className="flex flex-col flex-1">
                <FormLabel>Target</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="NGC 9999" />
                </FormControl>
                <FormDescription>The name of the target (e.g. NGC 7000).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Second row with Location taking full width */}
        <div className="w-full mb-4">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <LocationComboBox value={field.value as UUID} onChange={field.onChange} />
                </FormControl>
                <FormDescription>The location you captured your data for this imaging session.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <ButtonBar cancelButton>{isEdit ? "Save" : "Next"}</ButtonBar>
      </form>
    </Form>
  );
}
