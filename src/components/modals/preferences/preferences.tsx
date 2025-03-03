import { Modal } from '../../ui/custom/modal';
import { Separator } from '../../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import styles from './preferences.module.scss';
import AppearanceForm from './tabs/appearanceForm';
import SourceForm from './tabs/sourceForm';
import LocationsForm from './tabs/locationsForm';
import BackupForm from '@/components/modals/preferences/tabs/backupForm';
import { FolderPathBuilder, FolderPathBuilderType } from '@/components/modals/preferences/tabs/folderPathBuilder';
import { ReactNode } from 'react';

export function Preferences() {
  return (
    <Modal title="Preferences" subtitle="Customize AstroLog" separator={true}>
      <Tabs defaultValue="appearance" className={styles.preferences}>
        <TabsList className={styles.tabsList}>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="source">Source</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="imaging_sessions">Imaging Sessions</TabsTrigger>
          <TabsTrigger value="calibration_frames">Calibration Frames</TabsTrigger>
          <TabsTrigger value="location">Locations</TabsTrigger>
        </TabsList>
        <TabsContent value="appearance" className={styles.tabsContent}>
          <Content
            title="Appearance"
            subtitle="Customize the look and feel of AstroLog."
          >
            <AppearanceForm />
          </Content>
        </TabsContent>
        <TabsContent value="source" className={styles.tabsContent}>
          <Content
            title="Source"
            subtitle="Manage the way AstroLog loads your data."
          >
            <SourceForm />
          </Content>
        </TabsContent>
        <TabsContent value="backup" className={styles.tabsContent}>
          <Content
            title="Test"
            subtitle="Test"
          >
            <BackupForm />
          </Content>
        </TabsContent>
        <TabsContent value="imaging_sessions" className={styles.tabsContent}>
          <Content
            title="Imaging Sessions Folder Path Configuration"
            subtitle="Define a base folder and folder path pattern for your imaging sessions. The folder path can use predefined tokens and custom strings."
          >
            <FolderPathBuilder
              type={FolderPathBuilderType.IMAGING_SESSION}
            />
          </Content>
        </TabsContent>
        <TabsContent value="calibration_frames" className={styles.tabsContent}>
          <Content
            title="Calibration Frames Folder Path Configuration"
            subtitle="Define a base folder and folder path pattern for your calibration frames. The folder path can use predefined tokens and custom strings."
          >
            <FolderPathBuilder
              type={FolderPathBuilderType.CALIBRATION}
            />
          </Content>
        </TabsContent>
        <TabsContent value="location" className={styles.tabsContent}>
          <Content
            title="Location"
            subtitle="Change or specify user specific information."
          >
            <LocationsForm />
          </Content>
        </TabsContent>
      </Tabs>
    </Modal>
  );
}

interface ContentProps {
  title: string;
  subtitle: string;
  children?: ReactNode;
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
