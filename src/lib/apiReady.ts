// The first paint must not wait for the mock API (≈100 kB of MSW code). The app renders at once and
// every request waits here until the service worker is ready. With a real backend this resolves immediately.
let ready: Promise<void> = Promise.resolve();

export function setApiReady(promise: Promise<unknown>): void {
  ready = promise.then(
    () => undefined,
    () => undefined,
  );
}

export const whenApiReady = (): Promise<void> => ready;
