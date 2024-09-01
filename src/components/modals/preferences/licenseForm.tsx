import styles from './preferences.module.scss';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { useAppState } from '@/context/stateProvider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import FileSelector from '@/components/fileSelectors/fileSelector';
import { CopyButton } from '@/components/ui/button';

const formSchema = z.object({
  userEmail: z.string().min(2, {
    message: 'Username must be at least 2 characters.', // change
  }),
  licenseKey: z.string().min(2, {
    message: 'Username must be at least 2 characters.', // change
  }),
});

export default function LicenseForm() {
  const { toast } = useToast();
  const { appState } = useAppState();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userEmail: appState.preferences.license.user_email,
      licenseKey: appState.preferences.license.license_key,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: 'Success',
      description: 'Your preferences have been saved.',
      action: (
        <ToastAction onClick={() => console.log('test')} altText="Undo">
          Undo
        </ToastAction>
      ),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
        <FormField
          control={form.control}
          name="userEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <FileSelector {...field} disabled>
                  <CopyButton {...field} />
                </FileSelector>
              </FormControl>
              <FormDescription>
                The email you purchased AstroLog with.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="licenseKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License Key</FormLabel>
              <FormControl>
                <FileSelector {...field} disabled>
                  <CopyButton {...field} />
                </FileSelector>
              </FormControl>
              <FormDescription>Your license key for AstroLog.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div></div>
      </form>
    </Form>
  );
}
