import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import React, { Dispatch, SetStateAction } from 'react';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TabKey } from '@/components/modals/imagingSession/imagingSessionEditor';
import { ImagingSessionDetails } from '@/interfaces/imagingSessionEdit';
import { ButtonBar } from '@/components/ui/custom/modal';
import { Textarea } from '@/components/ui/textarea';
import { ImagingSessionDetailsSchema } from '@/schemas/imagingSessionSchema';

interface DetailsFormProps {
  setTab: Dispatch<SetStateAction<TabKey>>
  isEdit: boolean,
  setDetails: Dispatch<SetStateAction<ImagingSessionDetails | undefined>>,
  editSession: () => void,
}

export default function DetailsForm({ setTab, isEdit, setDetails, editSession }: DetailsFormProps) {
  const form = useForm<z.infer<typeof ImagingSessionDetailsSchema>>({
    resolver: zodResolver(ImagingSessionDetailsSchema),
    defaultValues: {
      gain: 0,
      sub_length: 0,
      notes: '',
      offset: undefined,
      camera_temp: undefined
    }
  });

  function onSubmit() {
    if (isEdit) {
      // TODO
      editSession();
      return;
    }

    const values = form.getValues();
    const details: ImagingSessionDetails = {
      sub_length: values.sub_length,
      gain: values.gain,
      notes: values.notes,
      offset: values.offset,
      camera_temp: values.camera_temp,
    }
    setDetails(details);
    setTab('equipment');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="gain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gain</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sub_length"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sub Length (seconds)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="offset"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Offset</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormDescription>Optional</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="camera_temp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Camera Temperature</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormDescription>Optional</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <ButtonBar>{isEdit ? 'Save' : 'Next'}</ButtonBar>
      </form>
    </Form>
  );
}
