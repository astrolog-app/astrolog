import styles from './preferences.module.scss';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ToastAction } from '@/components/ui/toast';
import { useToast } from "@/components/ui/use-toast";
import { useAppState } from "@/context/stateProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import OptionInput, { ChangeButton, OptionInputCopy } from "@/components/ui/custom/optionInput"
import { z } from "zod";

const formSchema = z.object({
    rootDirectory: z.string().min(2, {
        message: "Username must be at least 2 characters.", // change
    }),
    backupDirectory: z.string().min(2, {
        message: "Username must be at least 2 characters.", // change
    }),
    sourceDirectory: z.string().min(2, {
        message: "Username must be at least 2 characters.", // change
    }),
})

export default function StorageForm() {
    const { toast } = useToast()
    const { preferences } = useAppState();
    const [root, setRoot] = useState<string>(preferences.storage.root_directory);
    const [backup, setBackup] = useState<string>(preferences.storage.backup_directory);
    const [source, setSource] = useState<string>(preferences.storage.source_directory);
 
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            rootDirectory: root,
            backupDirectory: backup,
            sourceDirectory: source
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        toast({
            title: "Success",
            description: "Your preferences have been saved.",
            action: <ToastAction onClick={() => console.log("test")} altText="Undo">Undo</ToastAction>,
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
                <FormField
                    control={form.control}
                    name="rootDirectory"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Root Directory</FormLabel>
                            <FormControl>
                                <OptionInput value={root} disabled>
                                    <OptionInputCopy value={root} />
                                    <ChangeButton setValue={setRoot} />
                                </OptionInput>
                            </FormControl>
                            <FormDescription>
                                The directory in your filesystem where all of your astrophotos are
                                stored. For a better user experience, this data
                                should be available fast (e.g. on your computer).
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="backupDirectory"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Backup Directory (Optional)</FormLabel>
                            <FormControl>
                                <OptionInput value={backup} disabled>
                                    <OptionInputCopy value={backup} />
                                    <ChangeButton  setValue={setBackup} />
                                </OptionInput>
                            </FormControl>
                            <FormDescription>
                                The directory in your filesystem where all of your astrophotos are
                                stored as a backup. This is ideally on a cloud or a NAS.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="sourceDirectory"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Source Directory (Optional)</FormLabel>
                            <FormControl>
                                <OptionInput value={source} disabled>
                                    <OptionInputCopy value={source} />
                                    <ChangeButton  setValue={setSource} />
                                </OptionInput>
                            </FormControl>
                            <FormDescription>
                                The default source directory of your new imaging sessions.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div></div>
            </form>
        </Form>
    );
}


