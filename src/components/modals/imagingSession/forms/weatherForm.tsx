import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import React, { Dispatch, SetStateAction, useRef } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImagingSessionWeather } from '@/interfaces/imagingSessionEdit';
import { ButtonBar } from '@/components/ui/custom/modal';
import { ImagingSessionWeatherSchema } from '@/schemas/imagingSessionSchema';
import { UUID } from 'crypto';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface WeatherFormFormProps {
  prevTab: () => void,
  nextTab: () => void,
  isEdit: boolean,
  weather: ImagingSessionWeather,
  setWeather: Dispatch<SetStateAction<ImagingSessionWeather>>,
  editSession: () => void,
}

export default function WeatherForm({ prevTab, nextTab, isEdit, weather, setWeather, editSession }: WeatherFormFormProps) {
  const submitAction = useRef<"next" | "prev" | null>(null);

  const form = useForm<z.infer<typeof ImagingSessionWeatherSchema>>({
    resolver: zodResolver(ImagingSessionWeatherSchema),
    defaultValues: {
      outside_temp: weather.outside_temp,
      average_cloud_cover: weather.average_cloud_cover,
      average_seeing: weather.average_seeing,
    }
  });

  function onSubmit() {
    if (isEdit) {
      // TODO
      editSession();
      return;
    }

    const values = form.getValues();
    const newWeather: ImagingSessionWeather = {
      outside_temp: values.outside_temp,
      average_seeing: values.average_seeing,
      average_cloud_cover: values.average_cloud_cover
    }
    setWeather(newWeather);

    if (submitAction.current === "next") {
      nextTab();
    } else if (submitAction.current === "prev") {
      prevTab();
    }
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
