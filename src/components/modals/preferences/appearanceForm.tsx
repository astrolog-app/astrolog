
import { ThemeToggle } from '@/components/ui/custom/themeToggle';
import styles from './preferences.module.scss';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
    rootDirectory: z.string().min(2, {
        message: "Username must be at least 2 characters.", // change
    }),
})

export default function AppearanceForm() {
    const form = useForm<z.infer<typeof formSchema>>({});

    return (
        <Form {...form}>
            <form onSubmit={() => { }} className={styles.form}>
                <FormField
                    control={form.control}
                    name="rootDirectory"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Theme</FormLabel>
                            <FormDescription>
                                Select the theme for AstroLog.
                            </FormDescription>
                            <FormControl>
                                <ThemeToggle></ThemeToggle>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div></div>
            </form>
        </Form>
    );
}
