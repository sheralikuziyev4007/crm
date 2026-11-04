import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Info, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DEMO_CREDENTIALS } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { isApiError } from "@/lib/http";
import { useLogin } from "../hooks";
import { loginSchema, type LoginValues } from "../schemas";
import { FormAlert } from "@/components/common/FormAlert";

export function LoginForm() {
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    // Pre-filled so a visitor can try the demo with one click
    defaultValues: { email: DEMO_CREDENTIALS.email, password: DEMO_CREDENTIALS.password },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
      // The router (PublicOnlyRoute) takes the user to where they wanted to go
    } catch (error) {
      if (isApiError(error)) {
        for (const [field, message] of Object.entries(error.fields)) {
          if (field === "email" || field === "password") form.setError(field, { message });
        }
      }
      form.setError("root.server", { message: getErrorMessage(error) });
    }
  });

  const serverError = form.formState.errors.root?.server?.message;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div className="flex gap-2 rounded-md border border-primary/20 bg-accent/60 p-3 text-sm text-accent-foreground">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            Demo account is filled in: <span className="font-medium">{DEMO_CREDENTIALS.email}</span> /{" "}
            <span className="font-mono">{DEMO_CREDENTIALS.password}</span>
          </p>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" inputMode="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="pr-11"
                    {...field}
                  />
                </FormControl>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-1 top-1"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverError && <FormAlert message={serverError} />}

        <Button type="submit" className="w-full" size="lg" disabled={login.isPending}>
          {login.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {login.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </Form>
  );
}
