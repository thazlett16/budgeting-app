export interface DateRange {
  start: string;
  end: string;
}

export function rollingTwelveMonths(mostRecentActivityDate: Date): DateRange {
  const end = new Date(mostRecentActivityDate);
  const start = new Date(end);

  start.setMonth(start.getMonth() - 11);
  start.setDate(1);

  return { start: toIsoDate(start), end: toIsoDate(end) };
}

export function calendarYear(year: number): DateRange {
  return { start: `${year}-01-01`, end: `${year}-12-31` };
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
