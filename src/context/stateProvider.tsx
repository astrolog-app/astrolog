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
import { AppState } from '@/interfaces/state';
import { removeContextMenu } from '@/utils/browser';
import { Camera, Filter, Flattener, Mount, Telescope } from '@/interfaces/equipment';
import { UUID } from 'crypto';

const defaultAppState: AppState = {
  preferences: {
    storage: {
      root_directory: '',
      backup_directory: '',
      source_directory: '',
    },
    user: {
      weather_api_key: '',
    },
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
  analytics: {
    total_imaging_sessions: 0,
  },
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
      const responseData: AppState = JSON.parse(payload);

      const fixedAppState: AppState = {
        preferences: responseData.preferences,
        table_data: responseData.table_data,
        image_list: responseData.image_list,
        analytics: responseData.analytics,
        equipment_list: {
          cameras: new Map<UUID, Camera>(
            Object.entries(responseData.equipment_list.cameras || {}) as [UUID, Camera][]
          ),
          mounts: new Map<UUID, Mount>(
            Object.entries(responseData.equipment_list.mounts || {}) as [UUID, Mount][]
          ),
          telescopes: new Map<UUID, Telescope>(
            Object.entries(responseData.equipment_list.telescopes || {}) as [UUID, Telescope][]
          ),
          flatteners: new Map<UUID, Flattener>(
            Object.entries(responseData.equipment_list.flatteners || {}) as [UUID, Flattener][]
          ),
          filters: new Map<UUID, Filter>(
            Object.entries(responseData.equipment_list.filters || {}) as [UUID, Filter][]
          ),
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
    invoke('save_preferences', { preferences: appState.preferences }).catch(
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
