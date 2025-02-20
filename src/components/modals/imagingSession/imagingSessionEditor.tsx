'use client';

import { Modal } from '@/components/ui/custom/modal';
import { ImagingSession } from '@/interfaces/state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import GeneralForm from '@/components/modals/imagingSession/forms/generalForm';
import EquipmentForm from '@/components/modals/imagingSession/forms/equipmentForm';
import CalibrationForm from '@/components/modals/imagingSession/forms/calibrationForm';
import WeatherForm from '@/components/modals/imagingSession/forms/weatherForm';
import DetailsForm from '@/components/modals/imagingSession/forms/detailsForm';

const tabKeys = ['general', 'details', 'equipment', 'weather', 'calibration'] as const;
export type TabKey = (typeof tabKeys)[number];

interface ImagingSessionEditorProps {
  session: ImagingSession | undefined;
}

export default function ImagingSessionEditor({ session }: ImagingSessionEditorProps) {
  const isEdit = session !== undefined;
  const [tab, setTab] = useState<TabKey>("general");

  return (
    <Modal
      title="test"
      subtitle="subtitle"
      separator
    >
      <Tabs value={tab} onValueChange={(value: string) => setTab(value as TabKey)}>
        {isEdit && (
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="weather">Weather</TabsTrigger>
            <TabsTrigger value="calibration">Calibration</TabsTrigger>
          </TabsList>
        )}
        <TabsContent value="general">
          <GeneralForm setTab={setTab} />
        </TabsContent>
        <TabsContent value="details">
          <DetailsForm setTab={setTab} />
        </TabsContent>
        <TabsContent value="equipment">
          <EquipmentForm setTab={setTab} />
        </TabsContent>
        <TabsContent value="weather">
          <WeatherForm setTab={setTab} />
        </TabsContent>
        <TabsContent value="calibration">
          <CalibrationForm />
        </TabsContent>
      </Tabs>
    </Modal>
  );
}
