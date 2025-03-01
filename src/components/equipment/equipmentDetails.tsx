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
import { Clock, Settings, Star, SpaceIcon as Galaxy, Info, Pencil, Trash2 } from 'lucide-react';
import { EquipmentMonthlyUsage } from '@/components/analytics/equipmentMonthlyUsage';
import InfoCard from '@/components/analytics/infoCard';
import { Button } from '@/components/ui/button';
import { useModal } from '@/context/modalProvider';
import EquipmentModal from '@/components/modals/equipment/equipment';
import EquipmentNoteEditor from '@/components/modals/equipment/equipmentNoteEditor';
import { cn } from '@/utils/classNames';

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

      <QuickOverview />

      <Tabs defaultValue="specs">
        <TabsList className={styles.tabsList}>
          <TabsTrigger value="specs">Detailed Specs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="notes">Notes ({selectedItem.notes.size})</TabsTrigger>
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

function QuickOverview() {
  return (
    <div className={styles.overview}>
      <h2 className="text-xl font-semibold mb-4">Quick Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-500 rounded-full p-3">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Observation Time</p>
            <p className="text-2xl font-bold">127.5 hours</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-green-500 rounded-full p-3">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Objects Observed</p>
            <p className="text-2xl font-bold">342</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-purple-500 rounded-full p-3">
            <Galaxy className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Last Target</p>
            <p className="text-2xl font-bold">M31 Andromeda</p>
          </div>
        </div>
      </div>
    </div>
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

  // Convert map to array and sort by date (newest first)
  const noteArray = Array.from(selectedItem.notes.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      <div className={styles.equipmentNotes}>
        <div className={styles.title}>Equipment Notes</div>
        <Button
          onClick={() => openModal(<EquipmentNoteEditor item={selectedItem} />)}
          variant="secondary"
        >
          <Info className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>
      {noteArray.map((note, index) => (
        <Note className={styles.note} note={note} key={index} item={selectedItem} />
      ))}
    </>
  );
}

function Note({ className, note, item }: { className?: string, note: EquipmentNote, item: EquipmentItem }) {
  const { openModal } = useModal();

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  function deleteNote() {}

  return (
    <div
      className={cn(className, "group relative bg-gray-900 p-4 rounded-lg hover:bg-gray-800 transition-colors")}
    >
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-blue-400" />
        <p className="font-medium text-gray-100">{formatDate(note.date)}</p>
      </div>
      <p className="text-gray-300">{note.note}</p>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 mr-1"
          onClick={() => openModal(<EquipmentNoteEditor item={item} note={note} />)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-400 hover:text-red-300"
          onClick={() => deleteNote()}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
