import { useCallback, useLayoutEffect, useRef } from "react";

/**
 * Radix dialogs return focus to their Trigger, but our dialogs are opened from table rows and cards
 * without one. This remembers what had focus when the dialog opened and puts focus back on close;
 * if that element is gone (e.g. the row was deleted) focus goes to the main content instead of <body>.
 */
export function useReturnFocus(open: boolean) {
  const previous = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    // Runs before Radix moves focus into the dialog
    if (open) previous.current = document.activeElement as HTMLElement | null;
  }, [open]);

  return useCallback((event: Event) => {
    event.preventDefault();
    const target = previous.current?.isConnected ? previous.current : document.getElementById("main-content");
    target?.focus();
    previous.current = null;
  }, []);
}
