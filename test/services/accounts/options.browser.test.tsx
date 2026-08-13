import { describe, expect } from 'vite-plus/test';
import { renderHook } from 'vitest-browser-react';

import { useQuery } from '@tanstack/react-query';

import { MOCK_ACCOUNTS } from '#mock/handlers/accounts';
import { accountsOptions } from '#src/services/accounts/options';
import { test } from '#test/browser-util';
import { QueryClientHookTestUtils } from '#test/react-query/query-client-wrapper-util';

describe('accountsOptions', () => {
  // oxlint-disable-next-line vitest/prefer-importing-vitest-globals -- this is from a test fixture and therefore not a global
  test('listAccountsQueryOptions resolves accounts through the mocked Tauri IPC layer', async () => {
    const { wrapper } = QueryClientHookTestUtils.createWrapperComponent();

    const { result } = await renderHook(() => useQuery(accountsOptions.listAccountsQueryOptions()), {
      wrapper,
    });

    // oxlint-disable-next-line vitest/no-standalone-expect -- This fires because test is a fixture and not from `vitest`/`vite-plus/test`
    await expect.poll(() => result.current.isSuccess).toBeTruthy();

    // oxlint-disable-next-line vitest/no-standalone-expect -- This fires because test is a fixture and not from `vitest`/`vite-plus/test`
    expect(result.current.data).toStrictEqual(MOCK_ACCOUNTS);
  });
});
