'use client'

import { ThemeToggle } from '@/components/ui/custom/themeToggle';
import styles from '../preferences.module.scss';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAppState } from '@/context/stateProvider';
import { UnitSystem } from '@/enums/unitSystem';
import UnitToggle from '@/components/ui/custom/unitToggle';
import { invoke } from '@tauri-apps/api/core';
import { toast } from '@/components/ui/use-toast';

const formSchema = z.object({
  rootDirectory: z.string().min(2, {
    message: 'Username must be at least 2 characters.', // change
  }),
});

export default function AppearanceForm() {
  const form = useForm<z.infer<typeof formSchema>>({});
  const { appState, setAppState } = useAppState();

  function unitChange(value: UnitSystem) {
    const nextLocalConfig = { ...appState.local_config, unit: value };

    invoke("save_preferences", { localConfig: nextLocalConfig })
      .then(() => {
        // Only update the frontend after a successful save
        setAppState((prev) => ({
          ...prev,
          local_config: nextLocalConfig,
        }));
      })
      .catch((error) => {
        // optional: show a toast or log
        console.error("Failed to save preferences:", error);
        toast?.({
          variant: "destructive",
          title: "Save failed",
          description: String(error),
        });
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={() => {}} className={styles.form}>
        <FormField
          control={form.control}
          name="rootDirectory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit</FormLabel>
              <FormDescription>Select the unit system for AstroLog.</FormDescription>
              <FormControl>
                <UnitToggle value={appState.local_config.unit} onChange={unitChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rootDirectory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Theme</FormLabel>
              <FormDescription>Select the theme for AstroLog.</FormDescription>
              <FormControl>
                <ThemeToggle></ThemeToggle>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div></div>
      </form>
    </Form>
  );
}
