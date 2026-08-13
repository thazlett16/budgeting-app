import type { GenericSchema, InferInput, InferOutput } from 'valibot';
import { invoke } from '@tauri-apps/api/core';
import * as v from 'valibot';

/**
 * Validated `invoke()` wrapper shared by every domain's `client.ts` — calls
 * the Tauri command named in `entry.command` and parses the result against
 * `entry.output` before it reaches TanStack Query.
 */
export async function callTauriCommand<Input extends GenericSchema, Output extends GenericSchema>(
  entry: { command: string; input: Input; output: Output },
  args?: InferInput<Input>,
): Promise<InferOutput<Output>> {
  const result = await invoke(entry.command, args as Record<string, unknown> | undefined);

  return v.parse(entry.output, result);
}
