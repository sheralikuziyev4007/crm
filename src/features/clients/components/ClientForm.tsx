import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useId } from "react";
import { useForm } from "react-hook-form";
import { FormAlert } from "@/components/common/FormAlert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/errors";
import { isApiError } from "@/lib/http";
import { PHONE_HINT } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { STATUSES } from "../constants";
import { clientSchema, type ClientFormOutput, type ClientFormValues } from "../schemas";
import type { Client } from "../types";

const FIELDS = ["name", "company", "email", "phone", "status"] as const;
type FieldName = (typeof FIELDS)[number];
const isField = (key: string): key is FieldName => (FIELDS as readonly string[]).includes(key);

const EMPTY: ClientFormValues = { name: "", company: "", email: "", phone: "", status: "lead" };

const toValues = (client?: Client | null): ClientFormValues =>
  client
    ? {
        name: client.name,
        company: client.company,
        email: client.email,
        phone: client.phone,
        status: client.status,
      }
    : EMPTY;

interface ClientFormProps {
  client?: Client | null;
  onSubmit: (values: ClientFormOutput) => Promise<void>;
  onCancel: () => void;
  /** Lets the dialog know whether closing it would lose typed data */
  onDirtyChange?: (dirty: boolean) => void;
}

export function ClientForm({ client, onSubmit, onCancel, onDirtyChange }: ClientFormProps) {
  const statusLabelId = useId();
  const form = useForm<ClientFormValues, unknown, ClientFormOutput>({
    resolver: zodResolver(clientSchema),
    defaultValues: toValues(client),
    mode: "onTouched",
  });
  const { isDirty, isSubmitting, errors } = form.formState;

  useEffect(() => onDirtyChange?.(isDirty), [isDirty, onDirtyChange]);

  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      // Server validation and conflicts (e.g. duplicate email) appear next to the field they belong to
      const fieldErrors = isApiError(error)
        ? Object.entries(error.fields).filter(([key]) => isField(key))
        : [];
      fieldErrors.forEach(([key, message], i) =>
        form.setError(key as FieldName, { type: "server", message }, { shouldFocus: i === 0 }),
      );
      if (fieldErrors.length === 0) form.setError("root.server", { message: getErrorMessage(error) });
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Name <span aria-hidden="true">*</span>
              </FormLabel>
              <FormControl>
                <Input autoComplete="off" placeholder="Jane Cooper" aria-required="true" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input autoComplete="off" placeholder="Acme Inc. (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email <span aria-hidden="true">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    inputMode="email"
                    autoComplete="off"
                    placeholder="jane@acme.com"
                    aria-required="true"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Phone <span aria-hidden="true">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    inputMode="tel"
                    autoComplete="off"
                    placeholder="+1 415 555 0132"
                    aria-required="true"
                    {...field}
                  />
                </FormControl>
                {!errors.phone && <FormDescription>{PHONE_HINT}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <span id={statusLabelId} className="text-sm font-medium leading-none">
                Status
              </span>
              <div role="radiogroup" aria-labelledby={statusLabelId} className="grid grid-cols-3 gap-2">
                {STATUSES.map((s) => {
                  const selected = field.value === s.key;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => field.onChange(s.key)}
                      className={cn(
                        "flex h-10 items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        selected
                          ? cn(s.badgeClass, "border-transparent")
                          : "bg-card text-muted-foreground hover:bg-muted",
                      )}
                    >
                      <span aria-hidden="true" className={cn("size-2 rounded-full", s.dotClass)} />
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </FormItem>
          )}
        />

        {errors.root?.server?.message && <FormAlert message={errors.root.server.message} />}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
            {isSubmitting ? "Saving…" : client ? "Save changes" : "Add client"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
