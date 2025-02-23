import {
  Form
} from '@/components/ui/form';
import React, { Dispatch, SetStateAction } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TabKey } from '@/components/modals/imagingSession/imagingSessionEditor';
import { ImagingSessionWeather } from '@/interfaces/imagingSessionEdit';
import { ButtonBar } from '@/components/ui/custom/modal';
import { ImagingSessionWeatherSchema } from '@/schemas/imagingSessionSchema';

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

        <ButtonBar>{isEdit ? "Save" : "Next"}</ButtonBar>
      </form>
    </Form>
  );
}
