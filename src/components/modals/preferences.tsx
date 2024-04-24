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
          <Appearance />
        </TabsContent>
        <TabsContent value="storage" className={styles.tabsContent}>
          <Storage />
        </TabsContent>
        <TabsContent value="user" className={styles.tabsContent}>
          <User />
        </TabsContent>
        <TabsContent value="license" className={styles.tabsContent}>
          <License />
        </TabsContent>
      </Tabs>
    </Modal>
  );
}

interface HeaderProps {
  title: string;
  subtitle: string;
}

function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.title}>{title}</div>
      <div className={styles.subtitle}>{subtitle}</div>
      <Separator className={styles.separator} />
    </div>
  );
}

function Appearance() {
  return (
    <Header
      title="Appearance"
      subtitle="Customize the loook and feel of AstroLog."
    ></Header>
  );
}

function Storage() {
  return (
    <Header
      title="Storage"
      subtitle="Manage the way AstroLog saves and loads your data."
    ></Header>
  );
}

function User() {
  return (
    <Header
      title="User"
      subtitle="Change or specify user specific information."
    ></Header>
  );
}

function License() {
  return (
    <Header
      title="License"
      subtitle="Lookup your license key or activate AstroLog."
    ></Header>
  );
}
