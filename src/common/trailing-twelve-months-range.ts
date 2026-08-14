/** Rolling window covering the current month plus the 11 preceding it. */
export function trailingTwelveMonthsRange() {
  const today = Temporal.Now.plainDateISO();
  const start = today.with({ day: 1 }).subtract({ months: 11 });

  return { start: start.toString(), end: today.toString() };
}
