import { Modal } from '../ui/custom/modal';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import styles from './preferences.module.scss';
import { ThemeToggle } from '../ui/custom/themeToggle';
import { Button } from '../ui/button';
import { License, useAppState } from '@/context/stateProvider';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { z } from "zod";
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from 'react';
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

interface PreferencesProps {
  onClose: () => void;
}

export function Preferences({ onClose }: PreferencesProps) {
  return (
    <Modal
      title="Preferences"
      subtitle="Customize AstroLog"
      separator={true}
      onClose={onClose}
    >
      <Tabs defaultValue="appearance" className={styles.preferences}>
        <TabsList className={styles.tabsList}>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="user">User</TabsTrigger>
          <TabsTrigger value="license">License</TabsTrigger>
        </TabsList>
        <TabsContent value="appearance" className={styles.tabsContent}>
          <Content
            title="Appearance"
            subtitle="Customize the look and feel of AstroLog."
          >
            <AppearanceForm />
          </Content>
        </TabsContent>
        <TabsContent value="storage" className={styles.tabsContent}>
          <Content
            title="Storage"
            subtitle="Manage the way AstroLog saves and loads your data."
          >
            <StorageForm />
          </Content>
        </TabsContent>
        <TabsContent value="user" className={styles.tabsContent}>
          <Content
            title="User"
            subtitle="Change or specify user specific information."
          >
            <UserForm />
          </Content>
        </TabsContent>
        <TabsContent value="license" className={styles.tabsContent}>
          <Content
            title="License"
            subtitle="Lookup your license key or activate AstroLog."
          >
            <LicenseForm />
          </Content>
        </TabsContent>
      </Tabs>
    </Modal>
  );
}

interface ContentProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

function Content({ title, subtitle, children }: ContentProps) {
  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        <div className={styles.subtitle}>{subtitle}</div>
        <Separator className={styles.separator} />
      </div>
      <div className={styles.children}>{children}</div>
    </div>
  );
}

function AppearanceForm() {
  const form = useForm<z.infer<typeof formSchemaStorage>>({});

  return (
    <Form {...form}>
      <form onSubmit={() => {}} className={styles.form}>
        <FormField
          control={form.control}
          name="rootDirectory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Theme</FormLabel>
              <FormDescription>
              Select the theme for AstroLog.
              </FormDescription>
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

const formSchemaStorage = z.object({
  rootDirectory: z.string().min(2, {
    message: "Username must be at least 2 characters.", // change
  }),
  backupDirectory: z.string().min(2, {
    message: "Username must be at least 2 characters.", // change
  }),
})

const formSchema = z.object({
  userEmail: z.string().min(2, {
    message: "Username must be at least 2 characters.", // change
  }),
  licenseKey: z.string().min(2, {
    message: "Username must be at least 2 characters.", // change
  }),
})

function StorageForm() {
  const { toast } = useToast()
  const { preferences } = useAppState();
  const [isChanged, setIsChanged] = useState(false);

  const form = useForm<z.infer<typeof formSchemaStorage>>({
    resolver: zodResolver(formSchemaStorage),
    defaultValues: {
      rootDirectory: preferences.storage.root_directory,
      backupDirectory: preferences.storage.root_directory,
    },
  });

  const originalValue = preferences.storage.root_directory;
  const watchedValue = form.watch('rootDirectory');

  useEffect(() => {
    setIsChanged(watchedValue !== originalValue);
  }, [watchedValue, originalValue]);

  function onSubmit(values: z.infer<typeof formSchemaStorage>) {
    toast({
      title: "Success",
      description: "Your preferences have been saved.",
      action: <ToastAction onClick={() => console.log("test")} altText="Undo">Undo</ToastAction>,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
        <FormField
          control={form.control}
          name="rootDirectory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Root Directory</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                The directory in your filesystem where all of your astrophotos are
                stored. For a better user experience, this data
                should be available fast (e.g. on your computer).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="backupDirectory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Backup Directory</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                The directory in your filesystem where all of your astrophotos are
                stored as a backup. This is ideally on a cloud or a NAS.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className={styles.updateButton} type="submit" disabled={!isChanged}>
          Update storage
        </Button>
      </form>
    </Form>
  );
}

function UserForm() {
  const { toast } = useToast()
  const { preferences } = useAppState();
  const [isChanged, setIsChanged] = useState(false);

  const form = useForm<z.infer<typeof formSchemaStorage>>({
    resolver: zodResolver(formSchemaStorage),
    defaultValues: {
      rootDirectory: preferences.storage.root_directory,
    },
  });

  const originalValue = preferences.storage.root_directory;
  const watchedValue = form.watch('rootDirectory');

  useEffect(() => {
    setIsChanged(watchedValue !== originalValue);
  }, [watchedValue, originalValue]);

  function onSubmit(values: z.infer<typeof formSchemaStorage>) {
    toast({
      title: "Success",
      description: "Your preferences have been saved.",
      action: <ToastAction onClick={() => console.log("test")} altText="Undo">Undo</ToastAction>,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
        <FormField
          control={form.control}
          name="rootDirectory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weather API Key</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                The API key from OpenWeather.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className={styles.updateButton} type="submit" disabled={!isChanged}>
          Update user
        </Button>
      </form>
    </Form>
  );
}

function LicenseForm() {
  const { toast } = useToast()
  const { preferences } = useAppState();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userEmail: preferences.license.user_email,
      licenseKey: preferences.license.license_key,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Success",
      description: "Your preferences have been saved.",
      action: <ToastAction onClick={() => console.log("test")} altText="Undo">Undo</ToastAction>,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
        <FormField
          control={form.control}
          name="userEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormDescription>
                The email you purchased AstroLog with.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="licenseKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License Key</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormDescription>
                Your license key for AstroLog.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div></div>
      </form>
    </Form>
  );
}
