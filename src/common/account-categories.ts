import * as v from 'valibot';

/**
 * Enum-style constant map of supported account types.
 */
export const ACCOUNT_CATEGORY = {
  HSA: 'hsa',
  FOUR_01k: '401k',
  ROTH_401k: 'roth_401k',
  IRA: 'ira',
  ROTH_IRA: 'roth_ira',
  FOUR_01A: '401a',
  FOUR_03B: '403b',
  FOUR_57B: '457b',
  SAVINGS: 'savings',
  CHECKING: 'checking',
  HYSA: 'hysa',
  OTHER: 'other',
} as const;

/**
 * Union Type of the recognized account categories
 */
export type AccountCategory = (typeof ACCOUNT_CATEGORY)[keyof typeof ACCOUNT_CATEGORY];

/**
 * Array of the available account categories for picklist source or looping.
 */
export const ACCOUNT_CATEGORY_OPTIONS: AccountCategory[] = Object.values(ACCOUNT_CATEGORY);

/**
 * valibot schema for strings that match against the account categories values
 */
export const accountCategory = (message?: string) => v.picklist(ACCOUNT_CATEGORY_OPTIONS, message);
