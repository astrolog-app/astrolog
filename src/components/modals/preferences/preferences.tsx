import { Modal } from '../../ui/custom/modal';
import { Separator } from '../../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import styles from './preferences.module.scss';
import AppearanceForm from './appearanceForm';
import StorageForm from './storageForm';
import UserForm from './userForm';
import LicenseForm from './licenseForm';

export function Preferences() {
  return (
    <Modal
      title="Preferences"
      subtitle="Customize AstroLog"
      separator={true}
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
