/**
 * Celebrations: what we mark, and how we notice.
 *
 * The rule: celebrate completions the member CAUSED, never arrivals. An offer
 * landing in your inbox is an inbox event — the bell and the Bookings dot are
 * the right weight for it. Celebrating incoming things teaches people to
 * ignore the animation, and then the moments that should feel rare don't.
 *
 * Two ways a celebration starts:
 *
 *  1. A badge became earned. Badges are DERIVED server-side (no stored
 *     "earned at"), so there is no event to listen for — we notice by diffing
 *     the computed set against a small per-profile record of what this device
 *     has already shown.
 *
 *  2. One of three action moments fired, raised at the action site.
 *
 * Both render through the same overlay, so the app has one celebration, not a
 * collection of effects.
 */

const SEEN_KEY = (profileId) => `tora:badges-seen:${profileId}`;

/** Founding is the one badge worth showing to someone who already had it. */
const SEED_EXEMPT = ['founding'];

const readSeen = (profileId) => {
  try {
    const raw = localStorage.getItem(SEEN_KEY(profileId));
    return raw ? new Set(JSON.parse(raw)) : null;   // null = never recorded
  } catch {
    return null;
  }
};

const writeSeen = (profileId, keys) => {
  try {
    localStorage.setItem(SEEN_KEY(profileId), JSON.stringify([...keys]));
  } catch {
    /* private mode / quota — celebrations are not worth breaking a screen for */
  }
};

/**
 * A badge's identity for "have we shown this?" purposes.
 *
 * Tier is part of it: reaching Gold on a badge you already held at Silver is a
 * new moment, and keying on the badge alone would swallow it.
 */
const badgeId = (b) => (b.level ? `${b.key}:${b.level}` : b.key);

/**
 * Which badges deserve a reveal right now — and record them as shown.
 *
 * First run for a profile seeds SILENTLY: a member who has been using TORA for
 * months must not get five overlays in a row the day this ships. The exception
 * is the founding badge, which is a moment they were never given.
 *
 * Returns the badges to celebrate, in display order.
 */
export function collectBadgeReveals(profileId, badges) {
  if (!profileId || !Array.isArray(badges) || badges.length === 0) return [];

  const current = badges.filter((b) => b && b.key);
  const ids = new Set(current.map(badgeId));
  const seen = readSeen(profileId);

  if (seen === null) {
    writeSeen(profileId, ids);
    return current.filter((b) => SEED_EXEMPT.includes(b.key));
  }

  const fresh = current.filter((b) => !seen.has(badgeId(b)));
  if (fresh.length) writeSeen(profileId, ids);
  return fresh;
}

/**
 * Deal milestones, noticed the same way badges are.
 *
 * Two of the three moments cannot be raised where the button is pressed: the
 * promoter whose offer was ACCEPTED, and the party who countersigned second,
 * both learn about it on their own screen later. So the deal list is diffed on
 * load instead — the milestone belongs to the member, not to the click.
 *
 * Seeds silently on first run, for the same reason badges do: nobody wants a
 * stack of overlays for bookings they closed last month.
 */
const DEAL_SEEN_KEY = (profileId) => `tora:deal-moments-seen:${profileId}`;

const dealMilestones = (deal, profileId, ownedIds) => {
  const out = [];
  const mine = (id) => id && (id === profileId || ownedIds.has(id));

  // The offer landing a yes belongs to whoever sent it.
  if (deal.status === 'ACCEPTED' && mine(deal.initiatorId)) {
    out.push({ id: `${deal.id}:offer`, moment: MOMENT.OFFER_ACCEPTED, deal });
  }
  // Fully signed is the "it's official" beat, and it belongs to both sides.
  if (deal.contract?.status === 'FULLY_SIGNED' && !deal.contract?.skipped) {
    out.push({ id: `${deal.id}:signed`, moment: MOMENT.CONTRACT_SIGNED, deal });
  }
  return out;
};

export function celebrateDealMilestones(profileId, deals, ownedProfileIds = []) {
  if (!profileId || !Array.isArray(deals) || deals.length === 0) return;
  const owned = new Set(ownedProfileIds.filter(Boolean));

  const found = deals.flatMap((d) => dealMilestones(d, profileId, owned));
  const ids = found.map((m) => m.id);

  let seen;
  try {
    const raw = localStorage.getItem(DEAL_SEEN_KEY(profileId));
    seen = raw ? new Set(JSON.parse(raw)) : null;
  } catch { seen = null; }

  // Union, never replace: the deals list is paginated, so a milestone that
  // scrolls off the newest page would otherwise be forgotten and celebrated a
  // second time if it ever came back into view.
  const persist = (base) => {
    try {
      localStorage.setItem(DEAL_SEEN_KEY(profileId), JSON.stringify([...new Set([...base, ...ids])]));
    } catch { /* ignore */ }
  };

  if (seen === null) { persist([]); return; }       // first run — seed, say nothing

  const fresh = found.filter((m) => !seen.has(m.id));
  if (!fresh.length) return;
  persist(seen);

  for (const m of fresh) {
    celebrateMoment(m.moment, {
      name: m.deal.eventName || m.deal.venueName || '',
    });
  }
}

/** Raise a celebration from anywhere. App.js hosts the only listener. */
export function celebrate(detail) {
  window.dispatchEvent(new CustomEvent('tora:celebrate', { detail }));
}

/** Convenience for the badge path, so callers don't build the payload twice. */
export function celebrateBadges(profileId, badges) {
  for (const badge of collectBadgeReveals(profileId, badges)) {
    celebrate({ kind: 'badge', badgeKey: badge.key, tier: badge.tier || null });
  }
}

/** The three action moments. Named so the call sites read as English. */
export const MOMENT = {
  OFFER_ACCEPTED: 'offerAccepted',
  CONTRACT_SIGNED: 'contractSigned',
  REPRESENTATION: 'representationConfirmed',
};

export function celebrateMoment(moment, vars = {}) {
  celebrate({ kind: 'moment', moment, vars });
}
