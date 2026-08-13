import { accountsHandlers } from './accounts';
import { expensesHandlers } from './expenses';
import { incomeHandlers } from './income';
import { investmentsHandlers } from './investments';
import { lookupsHandlers } from './lookups';

export const handlers: Record<string, (args: Record<string, unknown> | undefined) => unknown> = {
  ...accountsHandlers,
  ...lookupsHandlers,
  ...investmentsHandlers,
  ...expensesHandlers,
  ...incomeHandlers,
};
