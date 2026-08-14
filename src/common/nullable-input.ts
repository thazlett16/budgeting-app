import * as v from 'valibot';

/**
 * This is just here for now till I publish next RC for form-util
 */
export function nullableInput<TSchema extends v.GenericSchema>(schema: TSchema) {
  return v.pipe(v.union([v.undefined(), v.null(), schema]), schema);
}
