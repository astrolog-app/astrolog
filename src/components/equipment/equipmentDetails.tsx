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
import { InfoCardData } from '@/interfaces/analytics';
import { toast } from '@/components/ui/use-toast';

interface EquipmentDetailsProps {
  selectedItem: EquipmentItem | undefined;
}

export default function EquipmentDetails({ selectedItem }: EquipmentDetailsProps) {
  const { openModal } = useModal();

  if (selectedItem === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground h-full">No item selected.</div>
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

      <Tabs defaultValue="specs">
        <TabsList className={styles.tabsList}>
          <TabsTrigger value="specs">Detailed Specs</TabsTrigger>
          {/*<TabsTrigger value="analytics">Analytics</TabsTrigger> TODO*/}
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
              <TableCell>{(selectedItem as Camera).is_monochrome ? 'Yes' : 'No'}</TableCell>
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
  const data: InfoCardData = {
    title: '',
    content: '',
    decrease: false,
    green: false,
    value: '',
    value_description: ''
  }
  return (
    <div>
      <EquipmentMonthlyUsage />
      <div className={styles.infoCards}>
        <InfoCard infoCard={data} className={styles.card} />
        <InfoCard infoCard={data} className={styles.card} />
        <InfoCard infoCard={data} className={styles.card} />
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

function Note({
                       className,
                       note,
                       item,
                     }: {
  className?: string
  note: EquipmentNote
  item: EquipmentItem
}) {
  const { openModal } = useModal()

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  function deleteNote() {
    toast({
      variant: 'destructive',
      title: 'Feature not implemented!',
      description: 'This feature will be available soon.'
    });
  }

  return (
    <div className={cn("group relative bg-muted p-4 rounded-lg hover:bg-muted/80 border transition-colors", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-primary" />
        <p className="font-medium text-foreground">{formatDate(note.date)}</p>
      </div>
      <p className="text-foreground/80">{note.note}</p>
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
          className="h-8 w-8 text-destructive hover:text-destructive/80"
          onClick={() => deleteNote()}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
