import { clearMocks, mockIPC } from '@tauri-apps/api/mocks';

import { handlers } from './handlers';

/**
 * Stands in for the Rust backend in tests: routes every `invoke()` call
 * through `handlers` by command name via Tauri's own IPC mocking API
 * (`@tauri-apps/api/mocks`). This is the Tauri-IPC equivalent of an msw
 * `setupWorker` — msw can't help here since `invoke()` isn't an HTTP call.
 */
export function installTauriIpcMocks(): void {
  mockIPC((command, args) => {
    const handler = handlers[command];

    if (!handler) {
      throw new Error(`Unhandled Tauri command in mocks: ${command}`);
    }

    return handler(args as Record<string, unknown> | undefined);
  });
}

export function resetTauriIpcMocks(): void {
  clearMocks();
  installTauriIpcMocks();
}
