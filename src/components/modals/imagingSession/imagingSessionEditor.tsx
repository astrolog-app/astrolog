'use client';

import styles from './imagingSessionEditor.module.scss';
import { Modal } from '@/components/ui/custom/modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import GeneralForm from '@/components/modals/imagingSession/forms/generalForm';
import EquipmentForm from '@/components/modals/imagingSession/forms/equipmentForm';
import CalibrationForm from '@/components/modals/imagingSession/forms/calibrationForm';
import WeatherForm from '@/components/modals/imagingSession/forms/weatherForm';
import DetailsForm from '@/components/modals/imagingSession/forms/detailsForm';
import { invoke } from '@tauri-apps/api/core';
import { toast } from '@/components/ui/use-toast';
import {
  ImagingSessionBase,
  ImagingSessionCalibration,
  ImagingSessionDetails,
  ImagingSessionEdit,
  ImagingSessionEquipment,
  ImagingSessionGeneral,
  ImagingSessionWeather
} from '@/interfaces/imagingSessionEdit';
import { ImagingSession } from '@/interfaces/state';
import { fetchAppState, useAppState } from '@/context/stateProvider';
import { useModal } from '@/context/modalProvider';

const tabKeys = ['general', 'details', 'equipment', 'weather', 'calibration'] as const;
export type TabKey = (typeof tabKeys)[number];

const defaultWeather: ImagingSessionWeather = {
  outside_temp: undefined,
  average_seeing: undefined,
  average_cloud_cover: undefined
};

const defaultCalibration: ImagingSessionCalibration = {
  dark_frame_list_id: undefined,
  bias_frame_list_id: undefined,
  flat_frames_to_classify: [],
  dark_frames_to_classify: []
};

interface ImagingSessionEditorProps {
  session?: ImagingSessionEdit,
  base: ImagingSessionBase,
}

export default function ImagingSessionEditor({ session, base }: ImagingSessionEditorProps) {
  const { setAppState } = useAppState();
  const { closeModal } = useModal();

  const isEdit = session !== undefined;
  const [tab, setTab] = useState<TabKey>('general');

  const [general, setGeneral] = useState<ImagingSessionGeneral | undefined>(undefined);
  const [equipment, setEquipment] = useState<ImagingSessionEquipment | undefined>(undefined);
  const [details, setDetails] = useState<ImagingSessionDetails | undefined>(undefined);
  const [weather, setWeather] = useState<ImagingSessionWeather>(defaultWeather);
  const [calibration, setCalibration] = useState<ImagingSessionCalibration>(defaultCalibration);

  function buildSession(): ImagingSessionEdit | undefined {
    if (
      base === undefined ||
      general === undefined ||
      equipment === undefined ||
      details === undefined
    ) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.'
      });
      return undefined;
    }

    return {
      base: base,
      general: general,
      equipment: equipment,
      details: details,
      weather: weather,
      calibration: calibration
    };
  }

  function editSession() {
    const newSession: ImagingSessionEdit | undefined = buildSession();

    if (newSession === undefined) {
      return;
    }

    invoke('edit_imaging_session', { session: newSession })
      .then(() => fetchAppState(setAppState))
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'Error: ' + error
        });
      });
  }

  function classifySession() {
    const newSession: ImagingSessionEdit | undefined = buildSession();

    if (newSession === undefined) {
      return;
    }

    invoke<ImagingSession>('classify_imaging_session', { session: newSession })
      .then((data) => {
        setAppState(prevState => ({
          ...prevState,
          table_data: {
            ...prevState.table_data,
            sessions: [...prevState.table_data.sessions, data]
          }
        }));
        fetchAppState(setAppState);
        closeModal();
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'Error: ' + error
        });
      });
  }

  return (
    <Modal
      title="Add Imaging Session"
      separator
      className={styles.modal}
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
          <GeneralForm
            setTab={setTab}
            isEdit={isEdit}
            setGeneral={setGeneral}
            editSession={editSession}
          />
        </TabsContent>
        <TabsContent value="details">
          <DetailsForm
            setTab={setTab}
            isEdit={isEdit}
            setDetails={setDetails}
            editSession={editSession}
          />
        </TabsContent>
        <TabsContent value="equipment">
          <EquipmentForm
            setTab={setTab}
            isEdit={isEdit}
            setEquipment={setEquipment}
            editSession={editSession}
          />
        </TabsContent>
        <TabsContent value="weather">
          <WeatherForm
            setTab={setTab}
            isEdit={isEdit}
            setWeather={setWeather}
            editSession={editSession}
          />
        </TabsContent>
        <TabsContent value="calibration">
          <CalibrationForm
            isEdit={isEdit}
            setCalibration={setCalibration}
            editSession={editSession}
            classifySession={classifySession}
          />
        </TabsContent>
      </Tabs>
    </Modal>
  );
}
