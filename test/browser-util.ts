import { test as baseTest } from 'vite-plus/test';

import { installTauriIpcMocks, resetTauriIpcMocks } from '#mock/tauri-ipc';

let mocksInstalled = false;

export const test = baseTest.extend('tauriIpc', { auto: true }, ({}, { onCleanup }) => {
  if (!mocksInstalled) {
    installTauriIpcMocks();
    mocksInstalled = true;
  }

  onCleanup(() => {
    resetTauriIpcMocks();
  });
});
