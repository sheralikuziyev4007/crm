import { builtinEnvironments, type Environment } from "vitest/environments";

/**
 * jsdom, plus a fix for navigation requests on newer Node versions.
 *
 * Vitest's jsdom environment swaps the global AbortController for jsdom's, but `Request`
 * stays Node's own (undici). React Router builds `new Request(url, { signal })` on every
 * navigation, and since Node 24 undici rejects a signal that is not its own AbortSignal:
 * "RequestInit: Expected signal to be an instance of AbortSignal".
 *
 * We keep jsdom's AbortController (DOM APIs such as addEventListener({ signal }) need it)
 * and only translate a jsdom signal into a native one when it reaches `Request`.
 */
const jsdomWithNativeSignals: Environment = {
  name: "jsdom-native-signals",
  transformMode: "web",
  async setup(global, options) {
    const NativeAbortController: typeof AbortController = global.AbortController;
    const NativeAbortSignal: typeof AbortSignal = global.AbortSignal;
    const NativeRequest: typeof Request = global.Request;

    const environment = await builtinEnvironments.jsdom.setup(global, options);

    // Both classes share the DOM `AbortSignal` type, so a plain `instanceof` would narrow to `never`
    const isNativeSignal = (signal: AbortSignal): boolean => signal instanceof NativeAbortSignal;

    const toNativeSignal = (signal: AbortSignal): AbortSignal => {
      if (isNativeSignal(signal)) return signal;
      const controller = new NativeAbortController();
      if (signal.aborted) controller.abort(signal.reason);
      else signal.addEventListener("abort", () => controller.abort(signal.reason), { once: true });
      return controller.signal;
    };

    class RequestWithNativeSignal extends NativeRequest {
      constructor(input: RequestInfo | URL, init?: RequestInit) {
        super(input, init?.signal ? { ...init, signal: toNativeSignal(init.signal) } : init);
      }
    }

    global.Request = RequestWithNativeSignal;

    // Node 25+ ships its own global localStorage/sessionStorage (undefined without --localstorage-file),
    // and Vitest will not override a global that already exists. Point them back at jsdom's storage.
    const storageKeys = ["localStorage", "sessionStorage"] as const;
    const nativeStorage = storageKeys.map(
      (key) => [key, Object.getOwnPropertyDescriptor(global, key)] as const,
    );
    const { window: jsdomWindow } = global.jsdom as { window: Window };
    for (const key of storageKeys) {
      Object.defineProperty(global, key, {
        configurable: true,
        enumerable: true,
        get: () => jsdomWindow[key],
      });
    }

    return {
      teardown(global) {
        for (const [key, descriptor] of nativeStorage) {
          if (descriptor) Object.defineProperty(global, key, descriptor);
          else delete global[key];
        }
        global.Request = NativeRequest;
        return environment.teardown(global);
      },
    };
  },
};

export default jsdomWithNativeSignals;
