import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import React, { Dispatch, SetStateAction } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TabKey } from '@/components/modals/imagingSession/imagingSessionEditor';
import { ImagingSessionWeather } from '@/interfaces/imagingSessionEdit';
import { ButtonBar } from '@/components/ui/custom/modal';
import { ImagingSessionWeatherSchema } from '@/schemas/imagingSessionSchema';
import { LocationComboBox } from '@/components/ui/comboBox';
import { UUID } from 'crypto';
import { Input } from '@/components/ui/input';

interface WeatherFormFormProps {
  setTab: Dispatch<SetStateAction<TabKey>>
  isEdit: boolean,
  setWeather: Dispatch<SetStateAction<ImagingSessionWeather>>,
  editSession: () => void,
}

export default function WeatherForm({ setTab, isEdit, setWeather, editSession }: WeatherFormFormProps) {
  const form = useForm<z.infer<typeof ImagingSessionWeatherSchema>>({
    resolver: zodResolver(ImagingSessionWeatherSchema),
  });

  function onSubmit() {
    if (isEdit) {
      // TODO
      editSession();
      return;
    }

    // TODO
    setTab('calibration');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* First row with two fields side by side */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <FormField
            control={form.control}
            name="outside_temp"
            render={({ field }) => (
              <FormItem className="flex flex-col flex-1">
                <FormLabel>Outside Temperature</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>Enter the current temperature in degrees Celsius</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="average_seeing"
            render={({ field }) => (
              <FormItem className="flex flex-col flex-1">
                <FormLabel>Average Seeing</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>Atmospheric seeing conditions (arcseconds)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Second row with single field */}
        <div className="mb-4">
          <FormField
            control={form.control}
            name="average_cloud_cover"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Average Cloud Cover</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>Percentage of sky covered by clouds (0-100%)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <ButtonBar>{isEdit ? "Save" : "Next"}</ButtonBar>
      </form>
    </Form>
  );
}
