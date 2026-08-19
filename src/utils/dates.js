// One place for date/time formatting, split by what the value MEANS — because
// the whole class of "event shows the wrong day" bugs (finding F5-01) came from
// deciding per-call-site whether to pin a timezone, and getting it wrong at 9
// of 11 sites.
//
// Two kinds of value, two functions:
//
//   formatEventDate  — a CALENDAR DATE (`@db.Date`: deal.date, tour start/end,
//     availableDates). Prisma returns these as UTC midnight, so they MUST be
//     rendered pinned to UTC or they shift a day for viewers west of UTC (a
//     Tokyo-set Oct 1 reads Sep 30 in São Paulo). The stored day is the day,
//     everywhere.
//
//   formatTimestamp  — a MOMENT IN TIME (`DateTime`: createdAt, message times).
//     These SHOULD render in the viewer's local zone — "sent 3:42pm" means
//     3:42pm where you are. Pinning these to UTC would be the same bug in
//     reverse.
//
// The name is the decision. A tenth calendar-date site can't reintroduce the
// bug by forgetting a flag, because there is no flag — you pick the function
// that matches the kind of value.

/**
 * Format a `@db.Date` calendar date, pinned to UTC so it reads as its stored
 * day in every timezone. `locale` is the app locale (e.g. t('dateFormat.locale')).
 * Returns '' for a null/invalid date.
 */
export function formatEventDate(value, locale, opts = {}) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(locale, {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...opts,
  });
}

/**
 * Format a `DateTime` moment in the viewer's LOCAL zone (a timestamp, not a
 * calendar date). Returns '' for a null/invalid value.
 */
export function formatTimestamp(value, locale, opts = {}) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...opts,
  });
}
