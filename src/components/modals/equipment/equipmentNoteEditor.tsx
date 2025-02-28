'use client';

import { ButtonBar, Modal } from '@/components/ui/custom/modal';
import { EquipmentItem, getEquipmentType, EquipmentNote } from '@/interfaces/equipment';
import { EquipmentType } from '@/enums/equipmentType';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import React from 'react';
import { useAppState } from '@/context/stateProvider';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import { invoke } from '@tauri-apps/api/core';
import { saveEquipment } from '@/components/modals/equipment/equipment';
import { UUID } from 'crypto';
import { toast } from '@/components/ui/use-toast';
import { useModal } from '@/context/modalProvider';

interface EquipmentNoteProps {
  item: EquipmentItem,
  note?: EquipmentNote,
}

const schema = z.object({
  note: z.string().min(1, 'A Note is required'),
});


export default function EquipmentNoteEditor({ item, note }: EquipmentNoteProps) {
  const { setAppState } = useAppState();
  const { closeModal } = useModal();

  const edit: boolean = note !== undefined;
  const type: EquipmentType = getEquipmentType(item);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      note: note?.note ?? ''
    }
  });

  function onSubmit() {
    const id: UUID = note?.id ?? uuidv4() as UUID;
    const equipment = saveEquipment[type];

    let new_item = item;
    const newNote: EquipmentNote = {
      id: id,
      date: note?.date ?? new Date(),
      note: form.getValues().note,
    }
    new_item.notes.set(id, newNote);

    invoke(equipment.invokeFn, { [equipment.key.slice(0, -1)]: new_item })
      .then(() => {
        setAppState(prevState => ({
          ...prevState,
          equipment_list: {
            ...prevState.equipment_list,
            [equipment.key]: new Map(prevState.equipment_list[equipment.key]).set(new_item.id, new_item)
          }
        }));
        toast({ description: `Saved ${type} successfully!` });
        closeModal();
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'Error: ' + error,
        });
      });
  }

  return (
    <Modal
      title={edit ? "Edit" : "Add" + " Note"}
      separator
      className='w-[600px]'
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <ButtonBar cancelButton>Save</ButtonBar>
        </form>
      </Form>
    </Modal>
  );
}
