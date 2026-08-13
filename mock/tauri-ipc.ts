import type { InvokeArgs } from '@tauri-apps/api/core';
import { clearMocks, mockIPC } from '@tauri-apps/api/mocks';

import { handlers } from './handlers';

function isRecordArgs(args: InvokeArgs | undefined): args is Record<string, unknown> | undefined {
  return (
    args === undefined || (!Array.isArray(args) && !(args instanceof ArrayBuffer) && !(args instanceof Uint8Array))
  );
}

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

    if (!isRecordArgs(args)) {
      throw new Error(`Unexpected non-object payload for command: ${command}`);
    }

    return handler(args);
  });
}

export function resetTauriIpcMocks(): void {
  clearMocks();
  installTauriIpcMocks();
}
