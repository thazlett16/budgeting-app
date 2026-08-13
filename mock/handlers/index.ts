import { accountsHandlers } from './accounts';

export const handlers: Record<string, (args: Record<string, unknown> | undefined) => unknown> = {
  ...accountsHandlers,
};
