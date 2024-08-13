import styles from './preferences.module.scss';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from "@/components/ui/use-toast";
import { useAppState } from "@/context/stateProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
    rootDirectory: z.string().min(2, {
        message: "Username must be at least 2 characters.", // change
    }),
})

export default function UserForm() {
    const { toast } = useToast()
    const { preferences } = useAppState();
    const [isChanged, setIsChanged] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            rootDirectory: preferences.storage.root_directory,
        },
    });

    const originalValue = preferences.storage.root_directory;
    const watchedValue = form.watch('rootDirectory');

    useEffect(() => {
        setIsChanged(watchedValue !== originalValue);
    }, [watchedValue, originalValue]);

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
                            <FormLabel>Weather API Key</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormDescription>
                                The API key from OpenWeather.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button className={styles.updateButton} type="submit" disabled={!isChanged}>
                    Update user
                </Button>
            </form>
        </Form>
    );
}
