'use client';

import { Preferences } from '@/components/modals/preferences/preferences';
import { invoke } from '@tauri-apps/api/tauri';
import { UUID } from 'crypto';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from 'react';
import { toast } from '@/components/ui/use-toast';

export interface AppState {
  preferences: Preferences;
  log_data: Session[];
  image_list: Image[];
}

export interface Preferences {
  storage: Storage;
  user: User;
  license: License;
}

export interface Storage {
  root_directory: string;
  backup_directory: string;
  source_directory: string;
}

export interface User {
  weather_api_key: string;
}

export interface License {
  activated: boolean;
  user_email: string;
  license_key: string;
}

export interface Session {
  id: UUID;
  date: string;
  target: string;
  sub_length: number;
  total_subs: number;
  integrated_subs: number;
  filter: string;
  gain: number;
  offset: number;
  camera_temp: number;
  outside_temp: number;
  average_seeing: number;
  average_cloud_cover: number;
  telescope: string;
  flattener: string;
  mount: string;
  camera: string;
  notes: string;
}

export interface Image {
  title: string;
  path: string;
  total_exposure: number;
}

const defaultAppState: AppState = {
  preferences: {
    storage: {
      root_directory: '',
      backup_directory: '',
      source_directory: ''
    },
    user: {
      weather_api_key: ''
    },
    license: {
      activated: false,
      user_email: '',
      license_key: ''
    }
  },
  log_data: [],
  image_list: []
};

interface AppStateContextType {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined
);

export default function StateProvider({ children }: { children: ReactNode }) {
  const [appState, setAppState] = useState<AppState>(defaultAppState);

  useEffect(() => {
    async function fetchData() {
      try {
        const responseString = await invoke<string>('load_frontend_app_state');
        const responseData: AppState = JSON.parse(responseString);

        setAppState(responseData);
      } catch (error) {
        const errorMsg = error as string;
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'Error: ' + errorMsg
        });
      }
    }

    fetchData();
  }, []);

  // disable browser ContextMenu and shortcuts
  useEffect(() => {
    const handleContextMenu = (event: { preventDefault: () => void; }) => {
      event.preventDefault();
    };

    const handleKeydown = (event: { ctrlKey: any; metaKey: any; key: string; preventDefault: () => void; }) => {
      // Check for Ctrl or Cmd key combinations
      if (
        (event.ctrlKey || event.metaKey) && // Ctrl on Windows/Linux or Cmd on macOS
        (event.key === 'p' || event.key === 's' || event.key === 'r' || event.key === 'f')
      ) {
        event.preventDefault();
        console.log(`Default shortcut for ${event.key.toUpperCase()} disabled`);
      }

      // prevent other default shortcut
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeydown);

    // Cleanup event listeners on unmount
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);

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
  setAppState: React.Dispatch<React.SetStateAction<AppState>>,
  path: string
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

  async function savePreferences() {
    try {
      await invoke('save_preferences', { preferences: appState.preferences });
    } catch (error) {
      const errorMsg = error as string;
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Error: ' + errorMsg
      });
    }
  }

  savePreferences();
}
