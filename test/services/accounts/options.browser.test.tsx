// import { useQuery } from '@tanstack/react-query';
//
// import { renderHook, waitFor } from 'vitest-browser-react';
//
// import { MOCK_ACCOUNTS } from '#mock/handlers/accounts';
// import { accountsOptions } from '#src/services/accounts/options';
//
// import { test } from '#test/browser-util';
// import { QueryClientHookTestUtils } from '#test/react-query/query-client-wrapper-util';
//
// test('listAccountsQueryOptions resolves accounts through the mocked Tauri IPC layer', async () => {
//   const { wrapper } = QueryClientHookTestUtils.createWrapperComponent();
//
//   const { result } = renderHook(() => useQuery(accountsOptions.listAccountsQueryOptions()), {
//     wrapper,
//   });
//
//   await waitFor(() => expect(result.current.isSuccess).toBe(true));
//
//   expect(result.current.data).toEqual(MOCK_ACCOUNTS);
// });
