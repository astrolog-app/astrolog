import { Button } from '../ui/button';
import { Modal } from '../ui/custom/modal';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import styles from './preferences.module.scss';

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
            <LicenseForm />
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

function Content({ onClose, title, subtitle, buttonMessage, children }: ContentProps) {
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
  return (
    <div></div>
  );
}

function StorageForm() {
  return (
    <div></div>
  );
}

function UserForm() {
  return (
    <div></div>
  );
}

function LicenseForm() {
  return (
    <div></div>
  );
}
