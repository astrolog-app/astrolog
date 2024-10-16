'use client';

import { Tab } from "@/components/ui/custom/tab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import styles from './equipment.module.scss';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useModal } from '@/context/modalProvider';
import EquipmentModal from '@/components/modals/equipment/equiipment';
import { EquipmentType } from '@/enums/equipmentType';

export default function Equipment() {
  const { openModal } = useModal();

  return (
    <Tab className={styles.page}>
      <Card>
        <CardHeader>
          <CardTitle>Equipment</CardTitle>
          <CardDescription>Manage your equipment.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="secondary"
            onClick={() => openModal(<EquipmentModal type={EquipmentType.TELESCOPE} />)}
          >
            Add Equipment Item
          </Button>
        </CardContent>
      </Card>
      <ResizablePanelGroup className={styles.content} direction="horizontal">
        <ResizablePanel defaultSize={30}>

        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70}>

        </ResizablePanel>
      </ResizablePanelGroup>
    </Tab>
  );
}