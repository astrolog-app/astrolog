import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import React, { Dispatch, SetStateAction, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImagingSessionDetails } from '@/interfaces/imagingSessionEdit';
import { ButtonBar } from '@/components/ui/custom/modal';
import { Textarea } from '@/components/ui/textarea';
import { ImagingSessionDetailsSchema } from '@/schemas/imagingSessionSchema';
import { Button } from '@/components/ui/button';

interface DetailsFormProps {
  prevTab: () => void,
  nextTab: () => void,
  isEdit: boolean,
  details: ImagingSessionDetails | undefined,
  setDetails: Dispatch<SetStateAction<ImagingSessionDetails | undefined>>,
  editSession: () => void,
}

export default function DetailsForm({ prevTab, nextTab, isEdit, details, setDetails, editSession }: DetailsFormProps) {
  const submitAction = useRef<"next" | "prev" | null>(null);

  const form = useForm<z.infer<typeof ImagingSessionDetailsSchema>>({
    resolver: zodResolver(ImagingSessionDetailsSchema),
    defaultValues: {
      gain: details?.gain ?? 0,
      sub_length: details?.sub_length ?? 0,
      notes: details?.notes ?? '',
      offset: details?.offset,
      camera_temp: details?.camera_temp
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

    if (submitAction.current === "next") {
      nextTab();
    } else if (submitAction.current === "prev") {
      prevTab();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Row 1: Gain and Sub Length */}
        <div className="grid grid-cols-2 gap-4">
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
                <FormDescription>Adjust the input sensitivity level</FormDescription>
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
                <FormDescription>Duration in seconds</FormDescription>
              </FormItem>
            )}
          />
        </div>

        {/* Row 2: Offset and Camera Temperature */}
        <div className="grid grid-cols-2 gap-4">
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
                <FormDescription>Optional - Time offset in seconds</FormDescription>
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
                <FormDescription>Optional - Temperature in degrees Celsius</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 3: Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription>Additional information or observations</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <ButtonBar name={isEdit ? "Save" : "Next"} onClick={() => (submitAction.current = "next")}>
          <Button
            variant='secondary'
            onClick={() => (submitAction.current = "prev")}
          >
            Prev
          </Button>
        </ButtonBar>
      </form>
    </Form>
  );
}
