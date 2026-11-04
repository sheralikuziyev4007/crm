import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { LIMITS } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { useAddNote } from "../hooks";
import { noteSchema, type NoteValues } from "../schemas";

export function NoteForm({ clientId }: { clientId: string }) {
  const addNote = useAddNote(clientId);
  const form = useForm<NoteValues>({ resolver: zodResolver(noteSchema), defaultValues: { body: "" } });
  const length = form.watch("body").length;

  const onSubmit = form.handleSubmit(async ({ body }) => {
    try {
      await addNote.mutateAsync(body);
      form.reset({ body: "" });
      toast.success("Note added");
    } catch (error) {
      form.setError("body", { type: "server", message: getErrorMessage(error) });
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="space-y-2">
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">New note</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write a note: a call summary, next steps, anything worth remembering…"
                  rows={3}
                  onKeyDown={(e) => {
                    // Ctrl/Cmd + Enter saves, like most note-taking tools
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void onSubmit();
                  }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "font-mono text-xs text-muted-foreground",
              length > LIMITS.noteMax && "text-danger",
            )}
            aria-live="polite"
          >
            {length}/{LIMITS.noteMax}
          </span>
          <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Send aria-hidden="true" />
            )}
            Add note
          </Button>
        </div>
      </form>
    </Form>
  );
}
