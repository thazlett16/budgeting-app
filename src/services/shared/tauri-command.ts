import type { GenericSchema, InferInput, InferOutput } from 'valibot';
import { invoke } from '@tauri-apps/api/core';
import * as v from 'valibot';

/**
 * Validated `invoke()` wrapper shared by every domain's `client.ts` — calls
 * the Tauri command named in `entry.command` and parses the result against
 * `entry.output` before it reaches TanStack Query. `Input` is constrained to
 * schemas whose inferred shape is already a valid `invoke()` args object, so
 * no type assertion is needed at the call site.
 */
export async function callTauriCommand<
  Input extends GenericSchema<Record<string, unknown> | undefined>,
  Output extends GenericSchema,
>(entry: { command: string; input: Input; output: Output }, args?: InferInput<Input>): Promise<InferOutput<Output>> {
  const result = await invoke(entry.command, args);

  return v.parse(entry.output, result);
}
