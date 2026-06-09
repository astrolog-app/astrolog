'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { api } from '@/lib/api';
import type { AppState } from '@/types/app-state';

interface AppStateContextType {
  appState: AppState | null;
  setAppState: Dispatch<SetStateAction<AppState | null>>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined,
);

// load the whole app state from the rust backend
async function fetchAppState(
  setAppState: Dispatch<SetStateAction<AppState | null>>,
) {
  try {
    const state = await api.getAppState();
    setAppState(state);
  } catch (err) {
    console.error('failed to load app state from backend', err);
  }
}

// disable the native right-click context menu
function removeContextMenu() {
  document.addEventListener('contextmenu', (e) => e.preventDefault());
}

export default function StateProvider({ children }: { children: ReactNode }) {
  const [appState, setAppState] = useState<AppState | null>(null);

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
