import { test as baseTest } from 'vite-plus/test';

import { installTauriIpcMocks, resetTauriIpcMocks } from '#mock/tauri-ipc';

let mocksInstalled = false;

export const test = baseTest
  // oxlint-disable-next-line eslint/no-empty-pattern -- Test can't run if we do an underscore variable and there is nothing in context that we need
  .extend('tauriIpc', { auto: true }, async ({}, { onCleanup }) => {
    if (!mocksInstalled) {
      installTauriIpcMocks();
      mocksInstalled = true;
    }

    onCleanup(() => {
      resetTauriIpcMocks();
    });
  });
