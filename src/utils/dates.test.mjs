import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatEventDate, formatTimestamp, clampDateRange } from './dates.js';

// This file is run under TZ=America/Sao_Paulo (see package.json "test") — a zone
// 3 hours west of UTC, where the off-by-one bug (F5-01) manifests. If the pin
// were missing, a UTC-midnight @db.Date would render as the previous day here.

test('formatEventDate pins UTC: a @db.Date reads as its stored day even west of UTC', () => {
  // 2026-10-01T00:00:00Z is Sep 30 21:00 in São Paulo. Pinned to UTC it stays Oct 1.
  assert.equal(formatEventDate('2026-10-01T00:00:00.000Z', 'en-US'), 'Oct 1, 2026');
  // Proof the ambient zone really is the adverse one: an UNPINNED render is Sep 30.
  const unpinned = new Date('2026-10-01T00:00:00.000Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  assert.equal(unpinned, 'Sep 30, 2026');
});

test('formatEventDate handles null/invalid without throwing', () => {
  assert.equal(formatEventDate(null, 'en-US'), '');
  assert.equal(formatEventDate(undefined, 'en-US'), '');
  assert.equal(formatEventDate('not-a-date', 'en-US'), '');
});

test('formatTimestamp renders in local zone (a moment, not a calendar date)', () => {
  // A moment IS zone-relative: 2026-10-01T00:00Z shown in São Paulo is Sep 30, 21:00.
  const s = formatTimestamp('2026-10-01T00:00:00.000Z', 'en-US');
  assert.match(s, /Sep 30, 2026/);
  assert.match(s, /09:00\s?PM|21:00/);
});

test('clampDateRange: a later start drags the end along', () => {
  assert.deepEqual(clampDateRange({ startDate: '2026-10-05', endDate: '2026-10-08' }, 'startDate', '2026-10-20'), { startDate: '2026-10-20', endDate: '2026-10-20' });
});
test('clampDateRange: an end before the start snaps to the start', () => {
  assert.deepEqual(clampDateRange({ startDate: '2026-09-09', endDate: '2026-09-09' }, 'endDate', '2026-09-02'), { startDate: '2026-09-09', endDate: '2026-09-09' });
});
test('clampDateRange: valid changes pass through, empty values never snap, custom keys work', () => {
  assert.deepEqual(clampDateRange({ startDate: '2026-09-09', endDate: '2026-09-12' }, 'endDate', '2026-09-30'), { startDate: '2026-09-09', endDate: '2026-09-30' });
  assert.deepEqual(clampDateRange({ startDate: '', endDate: '2026-09-12' }, 'startDate', '2026-09-20'), { startDate: '2026-09-20', endDate: '2026-09-20' });
  assert.deepEqual(clampDateRange({ startDate: '2026-09-09', endDate: '' }, 'endDate', ''), { startDate: '2026-09-09', endDate: '' });
  const keys = { start: 'depositDeadline', end: 'finalPaymentDeadline' };
  assert.deepEqual(clampDateRange({ depositDeadline: '2026-11-01', finalPaymentDeadline: '2026-11-10' }, 'depositDeadline', '2026-11-20', keys), { depositDeadline: '2026-11-20', finalPaymentDeadline: '2026-11-20' });
});
