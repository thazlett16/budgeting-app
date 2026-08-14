function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/** Rolling window covering the current month plus the 11 preceding it. */
export function trailingTwelveMonthsRange() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - 11, 1);

  return { start: formatIsoDate(start), end: formatIsoDate(today) };
}
