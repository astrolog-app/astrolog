import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Modal } from '../ui/custom/modal';
import { Form } from '../ui/form';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import styles from './preferences.module.scss';
import { invoke } from '@tauri-apps/api/tauri';

interface PreferencesProps {
  onClose: () => void;
}

interface Preferences {
  license: License;
}

interface License {
  activated: boolean;
  user_email: string;
  license_key: string;
}

export function Preferences({ onClose }: PreferencesProps) {
  const [preferences, setPreferences] = useState<Preferences | undefined>(undefined);

  useEffect(() => {
    async function fetchData() {
      try {
        const responseData = await invoke<string>('get_configuration');
        console.log(responseData)
        setPreferences(JSON.parse(responseData));
        console.log(preferences?.license.user_email)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

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
            onClose={onClose}
            title="Appearance"
            subtitle="Customize the loook and feel of AstroLog."
            buttonMessage="Update appearance"
          >
            <AppearanceForm />
          </Content>
        </TabsContent>
        <TabsContent value="storage" className={styles.tabsContent}>
          <Content
            onClose={onClose}
            title="Storage"
            subtitle="Manage the way AstroLog saves and loads your data."
            buttonMessage="Update storage"
          >
            <StorageForm />
          </Content>
        </TabsContent>
        <TabsContent value="user" className={styles.tabsContent}>
          <Content
            onClose={onClose}
            title="User"
            subtitle="Change or specify user specific information."
            buttonMessage="Update user"
          >
            <UserForm />
          </Content>
        </TabsContent>
        <TabsContent value="license" className={styles.tabsContent}>
          <Content
            onClose={onClose}
            title="License"
            subtitle="Lookup your license key or activate AstroLog."
            buttonMessage="Update license"
          >
            <LicenseForm license={preferences?.license} />
          </Content>
        </TabsContent>
      </Tabs>
    </Modal>
  );
}

interface ContentProps {
  onClose: () => void;
  title: string;
  subtitle: string;
  buttonMessage: string;
  children?: React.ReactNode;
}

function Content({
  onClose,
  title,
  subtitle,
  buttonMessage,
  children,
}: ContentProps) {
  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        <div className={styles.subtitle}>{subtitle}</div>
        <Separator className={styles.separator} />
      </div>
      <div className={styles.children}>{children}</div>
      <div className={styles.footer}>
        <Button onClick={onClose}>{buttonMessage}</Button>
      </div>
    </div>
  );
}

function AppearanceForm() {
  return <div></div>;
}

function StorageForm() {
  return <div></div>;
}

function UserForm() {
  return <div></div>;
}

function LicenseForm( { license } : { license : License | undefined }) {
  return (
    <form>
      <div className={styles.paragraph}>
        <div className={styles.paragraphHeader}>Email</div>
        <Input className={styles.input} value={license?.user_email} disabled />
        <div className={styles.paragraphFooter}>The email you purchased AstroLog with.</div>
      </div>
      <div className={styles.paragraph}>
        <div className={styles.paragraphHeader}>License Key</div>
        <Input className={styles.input} value={license?.license_key} disabled />
        <div className={styles.paragraphFooter}>Your license key for AstroLog</div>
      </div>
    </form>
  );
}
