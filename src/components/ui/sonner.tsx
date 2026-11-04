import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";

// Toast notifications (sonner), themed to match the app
function Toaster(props: ToasterProps) {
  const theme = useResolvedTheme();
  return (
    <Sonner
      theme={theme}
      position="bottom-right"
      closeButton
      toastOptions={{
        classNames: {
          toast: "group border bg-card text-card-foreground shadow-lg font-sans",
          description: "text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
