// `Profile.representedBy` is a JSONB array whose entries have accumulated
// three different id keys over time (`profileId`, `agentId`, `id`) and which
// older rows still store as a bare object rather than an array. Reading it by
// hand at every call site meant each one normalized slightly differently — a
// `find` keyed on `profileId || id` silently missed an `agentId`-keyed entry
// and fell back to a generic label.

export function toRepEntries(representedBy) {
  if (Array.isArray(representedBy)) return representedBy.filter(Boolean);
  return representedBy ? [representedBy] : [];
}

export function repEntryId(entry) {
  return entry ? (entry.profileId || entry.agentId || entry.id || null) : null;
}

export function repEntryName(entry) {
  return entry ? (entry.name || entry.agentName || null) : null;
}

// The entry for a specific agent, or null. Used wherever the UI has to address
// ONE agent — an artist can have several, so "the first one" is never right.
export function findRepEntry(representedBy, agentProfileId) {
  if (!agentProfileId) return null;
  return toRepEntries(representedBy).find((a) => repEntryId(a) === agentProfileId) || null;
}
