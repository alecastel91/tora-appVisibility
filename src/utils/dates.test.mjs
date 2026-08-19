import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatEventDate, formatTimestamp } from './dates.js';

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
