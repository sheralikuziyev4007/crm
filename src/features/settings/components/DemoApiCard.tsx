import { useQueryClient } from "@tanstack/react-query";
import { Database, RefreshCw, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getErrorMessage } from "@/lib/errors";
import { getMockControls, setMockControls, type MockControls } from "@/mocks/controls";
import { resetDemoData, type DemoDataset } from "../api";

// Lets a visitor see every UI state without a real backend: slow network, server errors, an empty account
export function DemoApiCard() {
  const queryClient = useQueryClient();
  const [controls, setControls] = useState<MockControls>(getMockControls);
  const [busy, setBusy] = useState<DemoDataset | null>(null);
  const slowId = useId();
  const errorId = useId();

  const toggle = (key: keyof MockControls, checked: boolean) =>
    setControls(setMockControls({ [key]: checked }));

  // resetQueries puts every screen back to "loading", so skeletons (or error states) show again
  const reload = () => {
    void queryClient.resetQueries();
    toast.info("Cached data cleared. Screens will load again.");
  };

  const reset = async (dataset: DemoDataset) => {
    setBusy(dataset);
    try {
      await resetDemoData(dataset);
      await queryClient.invalidateQueries();
      toast.success(dataset === "seed" ? "Demo data restored" : "All clients removed");
    } catch (error) {
      toast.error("Couldn't reset the data", { description: getErrorMessage(error) });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demo API</CardTitle>
        <CardDescription>
          This app talks to a mock REST API (Mock Service Worker). Use these switches to see the loading,
          error and empty states. They apply to this browser tab only.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor={slowId}>Slow network</Label>
              <p className="mt-1 text-xs text-muted-foreground">Adds about 2 seconds to every request.</p>
            </div>
            <Switch
              id={slowId}
              checked={controls.slowNetwork}
              onCheckedChange={(v) => toggle("slowNetwork", v)}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor={errorId}>Server error (500)</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Every data request fails. Sign-in still works.
              </p>
            </div>
            <Switch
              id={errorId}
              checked={controls.serverError}
              onCheckedChange={(v) => toggle("serverError", v)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t pt-5">
          <Button variant="outline" onClick={reload}>
            <RefreshCw /> Reload all data
          </Button>
          <Button variant="outline" onClick={() => void reset("seed")} disabled={busy !== null}>
            <Database /> Restore demo data
          </Button>
          <Button
            variant="outline"
            onClick={() => void reset("empty")}
            disabled={busy !== null}
            className="text-danger hover:bg-destructive/10 hover:text-danger"
          >
            <Trash2 /> Remove all clients
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
