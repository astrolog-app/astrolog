'use client';

import styles from './equipmentDetails.module.scss';
import {
  Camera,
  EquipmentItem,
  EquipmentNote,
  Filter,
  Flattener,
  getEquipmentType,
  Telescope
} from '@/interfaces/equipment';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { EquipmentType } from '@/enums/equipmentType';
import { getViewName } from '@/utils/equipment';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clock, Settings } from 'lucide-react';
import { EquipmentMonthlyUsage } from '@/components/analytics/equipmentMonthlyUsage';
import InfoCard from '@/components/analytics/infoCard';
import { Button } from '@/components/ui/button';
import { useModal } from '@/context/modalProvider';
import EquipmentModal from '@/components/modals/equipment/equipment';
import EquipmentNoteEditor from '@/components/modals/equipment/equipmentNoteEditor';

interface EquipmentDetailsProps {
  selectedItem: EquipmentItem | undefined;
}

export default function EquipmentDetails({ selectedItem }: EquipmentDetailsProps) {
  const { openModal } = useModal();

  if (selectedItem === undefined) {
    return (
      <div>No Item Selected.</div>
    );
  }

  const type: EquipmentType = getEquipmentType(selectedItem);

  return (
    <ScrollArea className={styles.component}>
      <div className={styles.top}>
        <div className={styles.left}>
          <div>
            <Badge className={styles.badge}>{type}</Badge>
            <div className={styles.title}>
              {getViewName(selectedItem)}
            </div>
          </div>
          <Button
            variant="secondary"
            size="lg"
            className={styles.button}
            onClick={() => openModal(<EquipmentModal type={type} item={selectedItem} />)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
        <div>{ /* Card */}</div>
      </div>

      <Tabs defaultValue="specs">
        <TabsList className={styles.tabsList}>
          <TabsTrigger value="specs">Detailed Specs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="specs">
          <EquipmentDetailsTable selectedItem={selectedItem} />
        </TabsContent>
        <TabsContent value="analytics">
          <EquipmentAnalytics selectedItem={selectedItem} />
        </TabsContent>
        <TabsContent value="notes">
          <EquipmentNotes selectedItem={selectedItem} />
        </TabsContent>
      </Tabs>

      { /* Gallery */}
    </ScrollArea>
  );
}

function EquipmentDetailsTable({ selectedItem }: { selectedItem: EquipmentItem }) {
  const type: EquipmentType = getEquipmentType(selectedItem);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Specification</TableHead>
          <TableHead>Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Brand</TableCell>
          <TableCell>{selectedItem.brand}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>{selectedItem.name}</TableCell>
        </TableRow>

        {/* Additional Rows Based on Type */}
        {type === EquipmentType.TELESCOPE && (
          <>
            <TableRow>
              <TableCell>Focal Length</TableCell>
              <TableCell>{(selectedItem as Telescope).focal_length} mm</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Aperture</TableCell>
              <TableCell>{(selectedItem as Telescope).aperture} mm</TableCell>
            </TableRow>
          </>
        )}
        {type === EquipmentType.CAMERA && (
          <>
            <TableRow>
              <TableCell>Chip Size</TableCell>
              <TableCell>{(selectedItem as Camera).chip_size}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Megapixel</TableCell>
              <TableCell>{(selectedItem as Camera).mega_pixel} MP</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>RGB</TableCell>
              <TableCell>{(selectedItem as Camera).rgb ? 'Yes' : 'No'}</TableCell>
            </TableRow>
          </>
        )}
        {type === EquipmentType.FILTER && (
          <TableRow>
            <TableCell>Filter Type</TableCell>
            <TableCell>{(selectedItem as Filter).filter_type}</TableCell>
          </TableRow>
        )}
        {type === EquipmentType.FLATTENER && (
          <TableRow>
            <TableCell>Factor</TableCell>
            <TableCell>{(selectedItem as Flattener).factor}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function EquipmentAnalytics({ selectedItem }: { selectedItem: EquipmentItem }) {
  return (
    <div>
      <EquipmentMonthlyUsage />
      <div className={styles.infoCards}>
        <InfoCard index={0} className={styles.card} />
        <InfoCard index={0} className={styles.card} />
        <InfoCard index={0} className={styles.card} />
      </div>
    </div>
  );
}

function EquipmentNotes({ selectedItem }: { selectedItem: EquipmentItem }) {
  const { openModal } = useModal();

  const noteArray = Array.from(selectedItem.notes.values());

  return (
    <>
      <Button
        onClick={() => openModal(<EquipmentNoteEditor item={selectedItem} />)}
      >
        Add Note
      </Button>
      {noteArray.map((note, index) => (
        <Note note={note} key={index} />
      ))}
    </>
  );
}

function Note({ note }: { note: EquipmentNote }) {
  const formatDate = (dateInput: string | number | Date): string => {
    const date = new Date(dateInput); // Ensure it's a Date object
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-blue-400" />
        <span className="font-medium">{formatDate(note.date)}</span>
      </div>
      <p className="text-gray-300">
        {note.note}
      </p>
    </div>
  );
}
