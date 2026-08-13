// Mirror of tora-backend/src/utils/emailDomain.js — the display half only.
//
// The panel has to tell an agent WHICH domain their work address must sit at
// before they type anything, and that sentence has to match what the server
// will actually accept. Deriving it from the raw host instead would state a
// stricter rule than the server enforces: a profile at
// booking.nightshift.co.uk would be told it needs @booking.nightshift.co.uk
// while the server happily accepts @nightshift.co.uk.
//
// Keep in sync with the backend copy — separate runtimes cannot share it.

const MULTI_PART_SUFFIXES = new Set([
  'co.uk', 'org.uk', 'me.uk', 'ltd.uk', 'plc.uk', 'net.uk', 'sch.uk', 'ac.uk', 'gov.uk',
  'com.au', 'net.au', 'org.au', 'edu.au', 'id.au',
  'co.nz', 'net.nz', 'org.nz',
  'co.jp', 'or.jp', 'ne.jp', 'ac.jp', 'go.jp',
  'co.kr', 'or.kr',
  'com.br', 'net.br', 'org.br',
  'com.mx', 'org.mx',
  'co.za', 'org.za',
  'com.ar', 'com.co', 'com.tr', 'com.sg', 'com.hk', 'com.tw', 'com.cn', 'com.pl',
]);

const ADMINISTRATIVE_SLD = new Set([
  'co', 'com', 'net', 'org', 'edu', 'gov', 'mil', 'ac', 'or', 'ne', 'go',
  'gob', 'nom', 'info', 'biz', 'web', 'sch', 'ltd', 'plc', 'firm', 'gen', 'ind',
]);

export function hostFromWebsite(website) {
  if (!website || typeof website !== 'string') return null;
  let v = website.trim().toLowerCase();
  if (!v) return null;
  v = v.replace(/^[a-z][a-z0-9+.-]*:\/\//, '');
  v = v.replace(/^[^/@]*@/, '');
  v = v.split(/[/?#]/)[0];
  v = v.split(':')[0];
  v = v.replace(/\.$/, '');
  if (v.startsWith('www.')) v = v.slice(4);
  if (!v || !v.includes('.') || v.includes(' ')) return null;
  if (!/^[a-z0-9.-]+$/.test(v)) return null;
  return v;
}

export function registrableDomain(host) {
  if (!host) return null;
  const parts = host.split('.').filter(Boolean);
  if (parts.length < 2) return null;
  const [second, last] = parts.slice(-2);
  const isSuffixPair = MULTI_PART_SUFFIXES.has(`${second}.${last}`)
    || (last.length === 2 && ADMINISTRATIVE_SLD.has(second));
  if (isSuffixPair) {
    if (parts.length < 3) return null;
    return parts.slice(-3).join('.');
  }
  return parts.slice(-2).join('.');
}

/** The domain a work email must sit at, given the profile's website. */
export function requiredEmailDomain(website) {
  return registrableDomain(hostFromWebsite(website));
}
