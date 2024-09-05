import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/custom/modal';
import styles from '@/components/modals/calibrationRowEditor.module.scss';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '@/components/ui/label';
import { PopoverContent, PopoverTrigger } from '../ui/popover';
import { Popover } from '../ui/popover';
import { CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Command } from '../ui/command';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import { cn } from '@/utils/classNames';
import { useModal } from '@/context/modalProvider';

const frameworks = [
  {
    value: 'next.js',
    label: 'Next.js'
  },
  {
    value: 'sveltekit',
    label: 'SvelteKit'
  },
  {
    value: 'nuxt.js',
    label: 'Nuxt.js'
  },
  {
    value: 'remix',
    label: 'Remix'
  },
  {
    value: 'astro',
    label: 'Astro'
  }
];

export default function CalibrationRowEditor() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');

  const { closeModal } = useModal();

  const formSchema = z.object({
    target: z.array(z.string()).min(1, {
      message: 'You must at least select one calibration frame.'
    })
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      target: []
    }
  });

  function onSubmit() {
  }

  return (
    <Modal
      title="Add Calibration Frames"
      separator
      className={styles.modal}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.row}>
            <Label className={styles.label}>Camera</Label>
            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem className={styles.item}>
                  <FormControl>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-[200px] justify-between"
                        >
                          {value
                            ? frameworks.find((framework) => framework.value === value)?.label
                            : 'Select framework...'}
                          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search framework..." className="h-9" />
                          <CommandList>
                            <CommandEmpty>No framework found.</CommandEmpty>
                            <CommandGroup>
                              {frameworks.map((framework) => (
                                <CommandItem
                                  key={framework.value}
                                  value={framework.value}
                                  onSelect={(currentValue) => {
                                    setValue(currentValue === value ? '' : currentValue);
                                    setOpen(false);
                                  }}
                                >
                                  {framework.label}
                                  <CheckIcon
                                    className={cn(
                                      'ml-auto h-4 w-4',
                                      value === framework.value ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={styles.row}>
            <Label className={styles.label}>Calibration Type</Label>
            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem className={styles.item}>
                  <FormControl>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select camera" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="camera1">Camera 1</SelectItem>
                        <SelectItem value="camera2">Camera 2</SelectItem>
                        <SelectItem value="camera3">Camera 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={styles.row}>
            <Label className={styles.label}>Gain</Label>
            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem className={styles.item}>
                  <FormControl>
                    <Input type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={styles.row}>
            <Label className={styles.label}>Sub Length</Label>
            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem className={styles.item}>
                  <FormControl>
                    <Input type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={styles.row}>
            <Label className={styles.label}>Camera Temp.</Label>
            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem className={styles.item}>
                  <FormControl>
                    <Input type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={styles.row}>
            <Label className={styles.label}>Total Subs</Label>
            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem className={styles.item}>
                  <FormControl>
                    <Input type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={styles.buttons}>
            <Button
              className={styles.nextButton}
              type="button"
              variant="secondary"
              onClick={() => closeModal()}
            >Cancel</Button>
            <Button className={styles.nextButton} type="submit">Save</Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
