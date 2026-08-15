import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getAvatarClass, roleLabel } from '../../utils/roles';

/**
 * The liked / liked-by / connections lists.
 *
 * Rows are buttons, not static divs: a list of people you know is somewhere
 * you expect to tap through to a profile, and three copies of this markup on
 * the profile screen were read-only while the identical list on someone
 * else's profile was already tappable.
 *
 * `avatar` falls back to the initial on the role-coloured gradient, so a
 * profile without a picture still reads as that person rather than as a gap.
 */
const ProfileListRows = ({ profiles, emptyText, onOpenProfile }) => {
  const { t } = useLanguage();
  const rows = Array.isArray(profiles) ? profiles : [];

  if (rows.length === 0) {
    return <p className="text-sm text-white/40 text-center m-0 py-6">{emptyText}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onOpenProfile && onOpenProfile(p)}
          className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-[#0a0a0e]
                     px-3 py-2.5 text-left cursor-pointer transition-colors hover:border-infrared/40"
        >
          <span className={`w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center
                            text-sm font-semibold text-white ${getAvatarClass(p.role)}`}>
            {p.avatar
              ? <img src={p.avatar} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
              : (p.name || '?').charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-white">{p.name}</span>
            <span className="block text-[10px] uppercase tracking-[0.15em] text-white/40 font-tech">
              {roleLabel(p.role, t)}{p.city ? ` · ${p.city}` : ''}
            </span>
          </span>
          <span className="shrink-0 text-white/25" aria-hidden="true">›</span>
        </button>
      ))}
    </div>
  );
};

export default ProfileListRows;
