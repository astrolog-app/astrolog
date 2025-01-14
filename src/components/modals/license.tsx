'use client';

import { Modal } from '@/components/ui/custom/modal';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '../ui/button';
import { toast } from '@/components/ui/use-toast';
import { useModal } from '@/context/modalProvider';

const formSchema = z.object({
  license: z.string().min(1, 'License key is required.'),
});

export default function License() {
  const { closeModal } = useModal();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      license: '',
    },
  });

  const validateKey = useCallback(async () => {
    const { validateKey, resetLicense, resetLicenseKey } = await import(
      'tauri-plugin-keygen-api'
    );

    validateKey({ key: form.getValues().license })
      .then((license) => {
        if (license.valid) {
          closeModal();
          toast({
            title: 'Success',
            description: 'You have successfully activated AstroLog!',
          });
        } else {
          resetLicense();
          resetLicenseKey();
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: 'Error:',
          });
        }
      })
      .catch((e) =>
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'Error: ' + e,
        }),
      );
  }, []);

  function onSubmit() {
    validateKey();
  }

  return (
    <Modal
      title="Activate License"
      subtitle="To use AstroLog you have to have an active license."
      notClosable
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="pt-2">
          <FormField
            control={form.control}
            name="license"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Key</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  The license key that was sent to you via email.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="mt-4" type="submit">
            Validate
          </Button>
        </form>
      </Form>
    </Modal>
  );
}
