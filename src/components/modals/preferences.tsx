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
  const { preferences } = useAppState();

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
            <StorageForm onClose={onClose} />
          </Content>
        </TabsContent>
        <TabsContent value="user" className={styles.tabsContent}>
          <Content
            title="User"
            subtitle="Change or specify user specific information."
          >
            <UserForm onClose={onClose} />
          </Content>
        </TabsContent>
        <TabsContent value="license" className={styles.tabsContent}>
          <Content
            title="License"
            subtitle="Lookup your license key or activate AstroLog."
          >
            <LicenseForm license={preferences?.license} />
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
  return (
    <form className={styles.form}>
      <div className={styles.paragraph}>
        <div className={styles.paragraphHeader}>Theme</div>
        <div className={styles.paragraphFooter}>
          Select the theme for AstroLog.
        </div>
        <ThemeToggle />
      </div>
    </form>
  );
}

const formSchema = z.object({
  rootDirectory: z.string().min(2, {
    message: "Username must be at least 2 characters.", // change
  }),
})

function StorageForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast()
  const { preferences } = useAppState();
  const [isChanged, setIsChanged] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rootDirectory: preferences.storage.root_directory,
    },
  });

  const originalValue = preferences.storage.root_directory;
  const watchedValue = form.watch('rootDirectory');

  useEffect(() => {
    setIsChanged(watchedValue !== originalValue);
  }, [watchedValue, originalValue]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onClose();
    toast({
      title: "Success",
      description: "Your preferences have been saved.",
      action: <ToastAction onClick={()=> console.log("test")} altText="Undo">Undo</ToastAction>,
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
                stored.
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

function UserForm({ onClose }: { onClose: () => void }) {
  return (
    <form className={styles.form}>
      <div className={styles.paragraph}>
        <div className={styles.paragraphHeader}>Weather API Key</div>
        <Input className={styles.input} value="" />
        <div className={styles.paragraphFooter}>
          The API key from OpenWeather.
        </div>
      </div>
      <Button className={styles.updateButton} onClick={onClose}>
        Update user
      </Button>
    </form>
  );
}

function LicenseForm({ license }: { license: License | undefined }) {
  return (
    <form className={styles.form}>
      <div className={styles.paragraph}>
        <div className={styles.paragraphHeader}>Email</div>
        <Input className={styles.input} value={license?.user_email} disabled />
        <div className={styles.paragraphFooter}>
          The email you purchased AstroLog with.
        </div>
      </div>
      <div className={styles.paragraph}>
        <div className={styles.paragraphHeader}>License Key</div>
        <Input className={styles.input} value={license?.license_key} disabled />
        <div className={styles.paragraphFooter}>
          Your license key for AstroLog.
        </div>
      </div>
    </form>
  );
}
