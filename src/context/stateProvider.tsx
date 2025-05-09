'use client';

import { invoke } from '@tauri-apps/api/core';
import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import { toast } from '@/components/ui/use-toast';
import {
  AppState,
  CalibrationFrame,
  Config,
  FolderPaths,
  GalleryImage,
  ImagingSession,
  LocalConfig,
  Location
} from '@/interfaces/state';
import { removeContextMenu } from '@/utils/browser';
import { Camera, EquipmentItem, EquipmentNote, Filter, Flattener, Mount, Telescope } from '@/interfaces/equipment';
import { UUID } from 'crypto';
import { Analytics } from '@/interfaces/analytics';

const defaultAppState: AppState = {
  initialised: false,
  local_config: {
    root_directory: '',
    source_directory: '',
  },
  config: {
    folder_paths: {
      imaging_session_base_folder: "",
      imaging_session_pattern: "",
      calibration_base_folder: "",
      dark_frame_pattern: "",
      bias_frame_pattern: "",
    },
    locations: new Map<UUID, Location>(),
  },
  table_data: {
    sessions: [],
    calibration: [],
  },
  equipment_list: {
    cameras: new Map<UUID, Camera>(),
    mounts: new Map<UUID, Mount>(),
    telescopes: new Map<UUID, Telescope>(),
    flatteners: new Map<UUID, Flattener>(),
    filters: new Map<UUID, Filter>(),
  },
  image_list: [],
  analytics: null,
};

interface AppStateContextType {
  appState: AppState;
  setAppState: Dispatch<SetStateAction<AppState>>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined,
);

export function fetchAppState(setAppState: Dispatch<SetStateAction<AppState>>): void {
  invoke<string>('load_frontend_app_state')
    .then((payload) => {
      // Define the raw JSON shape for equipment items:
      type RawEquipmentItem<T> = Omit<T, 'notes'> & { notes?: Record<UUID, EquipmentNote> };

      // Parse the payload. Note: imaging session dates come as strings.
      const responseData = JSON.parse(payload) as {
        local_config: LocalConfig;
        config: {
          folder_paths: FolderPaths;
          locations: Record<UUID, Location>;
        };
        table_data: {
          sessions: Array<Omit<ImagingSession, 'date'> & { date: string }>;
          calibration: CalibrationFrame[];
        };
        equipment_list: {
          cameras?: Record<UUID, RawEquipmentItem<Camera>>;
          telescopes?: Record<UUID, RawEquipmentItem<Telescope>>;
          mounts?: Record<UUID, RawEquipmentItem<Mount>>;
          filters?: Record<UUID, RawEquipmentItem<Filter>>;
          flatteners?: Record<UUID, RawEquipmentItem<Flattener>>;
        };
        image_list: GalleryImage[];
        analytics: Analytics | null;
      };

      // Convert a Record of equipment notes to a Map,
      // converting each note's date string to an actual Date.
      const convertNotes = (notes?: Record<UUID, EquipmentNote>): Map<UUID, EquipmentNote> => {
        return new Map<UUID, EquipmentNote>(
          Object.entries(notes || {}).map(([noteId, note]) => [
            noteId as UUID,
            { ...note, date: new Date(note.date) },
          ])
        );
      };

      // Convert a Record of raw equipment items to a Map,
      // converting the nested notes using convertNotes.
      const parseEquipmentItem = <T extends EquipmentItem>(
        items: Record<UUID, RawEquipmentItem<T>> | undefined
      ): Map<UUID, T> => {
        const map = new Map<UUID, T>();
        if (!items) return map;
        for (const [id, item] of Object.entries(items)) {
          map.set(id as UUID, {
            ...item,
            notes: convertNotes(item.notes),
          } as T);
        }
        return map;
      };

      // Convert imaging session date strings to Date objects.
      const sessions = responseData.table_data.sessions.map((session) => ({
        ...session,
        date: new Date(session.date),
      }));

      // Convert config.locations from a Record to a Map.
      const rawLocations = responseData.config.locations;
      const locationsMap = new Map<UUID, Location>(
        Object.entries(rawLocations).map(([id, location]) => [id as UUID, location as Location])
      );

      const fixedConfig: Config = {
        folder_paths: responseData.config.folder_paths,
        locations: locationsMap,
      };

      let fixedAnalytics: Analytics | null = null;
      if (responseData.analytics) {
        fixedAnalytics = {
          ...responseData.analytics,
          sessions_chart: responseData.analytics.sessions_chart.map((item) => ({
            ...item,
            date: new Date(item.date),
          })),
        };
      }

      // Construct the final AppState with parsed dates, equipment Maps, and config.locations as a Map.
      const fixedAppState: AppState = {
        initialised: true,
        local_config: responseData.local_config,
        config: fixedConfig,
        table_data: {
          sessions,
          calibration: responseData.table_data.calibration,
        },
        image_list: responseData.image_list,
        analytics: fixedAnalytics,
        equipment_list: {
          cameras: parseEquipmentItem<Camera>(responseData.equipment_list.cameras),
          telescopes: parseEquipmentItem<Telescope>(responseData.equipment_list.telescopes),
          mounts: parseEquipmentItem<Mount>(responseData.equipment_list.mounts),
          filters: parseEquipmentItem<Filter>(responseData.equipment_list.filters),
          flatteners: parseEquipmentItem<Flattener>(responseData.equipment_list.flatteners),
        },
      };

      setAppState(fixedAppState);
    })
    .catch((error) => {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Error: ' + error,
      });
    });
}

export default function StateProvider({ children }: { children: ReactNode }) {
  const [appState, setAppState] = useState<AppState>(defaultAppState);

  useEffect(() => {
    fetchAppState(setAppState);
    removeContextMenu();
  }, []);

  useEffect(() => {
    console.log(appState);
  }, [appState]);

  return (
    <AppStateContext.Provider value={{ appState, setAppState }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within a StateProvider');
  }
  return context;
}

export function savePreferences(
  value: string,
  appState: AppState,
  setAppState: Dispatch<SetStateAction<AppState>>,
  path: string,
) {
  const keys = path.split('.');

  setAppState((prevAppState) => {
    const updatedState = { ...prevAppState };
    let current: any = updatedState;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    return updatedState;
  });

  function savePreferences() {
    invoke('save_preferences', { local_config: appState.local_config }).catch(
      (error) => {
        const errorMsg = error as string;
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'Error: ' + errorMsg,
        });
      },
    );
  }

  savePreferences();
}
