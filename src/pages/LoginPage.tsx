import { BarChart3, CheckCircle2, KanbanSquare, NotebookPen } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useAuthStore } from "@/store/authStore";

const HIGHLIGHTS = [
  { icon: BarChart3, text: "Pipeline analytics at a glance" },
  { icon: KanbanSquare, text: "Drag-and-drop Kanban board" },
  { icon: NotebookPen, text: "Notes and full activity history per client" },
  { icon: CheckCircle2, text: "CSV export of any filtered view" },
];

const REASON_MESSAGES = {
  "signed-out": "You have been signed out.",
  expired: "Your session has expired. Please sign in again.",
} as const;

export default function LoginPage() {
  useDocumentTitle("Sign in");
  const reason = useAuthStore((s) => s.signOutReason);

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-indigo-700 to-violet-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 size-96 rounded-full bg-white/10 blur-3xl"
        />
        <p className="relative font-display text-xl font-bold">Pipeline CRM</p>
        <div className="relative">
          <p className="max-w-md font-display text-4xl font-bold leading-tight">
            Every client, every deal, one calm dashboard.
          </p>
          <ul className="mt-8 space-y-3 text-white/90">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/80">
          Portfolio project · React 19 · TypeScript · TanStack Query
        </p>
      </section>

      <main className="bg-glow flex flex-col px-6 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo className="lg:invisible" />
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to manage your clients and pipeline.</p>
          {reason && (
            <p role="status" className="mt-6 rounded-md border bg-card px-3 py-2 text-sm">
              {REASON_MESSAGES[reason]}
            </p>
          )}
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  );
}
