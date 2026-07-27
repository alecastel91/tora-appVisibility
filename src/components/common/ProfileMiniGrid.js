import React, { useRef, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getAvatarClass, ROLE_COLOR } from '../../utils/roles';

// Minimal per-role stroke glyphs in the app's feather style (neither the
// marketing site nor icons.js has role iconography) — language-independent,
// tinted via currentColor, crisp at chip size.
const ROLE_GLYPHS = {
  ARTIST: ( // musical note
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>
  ),
  AGENT: ( // briefcase (same geometry as icons.js BriefcaseIcon)
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </>
  ),
  PROMOTER: ( // megaphone
    <>
      <path d="M21 4L7 9H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h3l14 5V4z" />
      <path d="M8 15v4a1 1 0 0 0 1 1h2" />
    </>
  ),
  VENUE: ( // building
    <>
      <path d="M3 21V8l9-5 9 5v13" />
      <path d="M9 21v-6h6v6" />
      <path d="M1 21h22" />
    </>
  ),
};

// Compact profile tiles (avatar + name).
//
// variant="grid" (default — network strips): one row of three; when more
// exist the 3rd tile carries a "+N" overlay and tapping it expands the strip
// inline (drawer-style) with a "See less" collapse.
//
// variant="scroll" (recommendation strips): smaller tiles — 4 per row plus a
// sliver of the 5th peeking in so the horizontal scroll is discoverable —
// in a single snap row with a right-edge fade while more content remains.
// Each tile carries a role chip: a small role icon tinted with the canonical
// role color (language-independent, Artist/Agent stay distinct).
const ProfileMiniGrid = ({ profiles, onOpenProfile, variant = 'grid' }) => {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef(null);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);

  const list = Array.isArray(profiles) ? profiles : [];
  if (list.length === 0) return null;

  const roleChip = (role) => (
    <span
      className="absolute top-1 left-1 flex items-center justify-center rounded border bg-black/70 p-0.5"
      style={{ color: ROLE_COLOR[role] || '#fff', borderColor: `${ROLE_COLOR[role] || '#ffffff'}55` }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {ROLE_GLYPHS[role] || <circle cx="12" cy="12" r="9" />}
      </svg>
    </span>
  );

  const renderTile = (p, overlayCount, withRoleChip) => (
    <button
      key={p.id}
      type="button"
      onClick={() => (overlayCount ? setExpanded(true) : onOpenProfile && onOpenProfile(p))}
      className={`group block p-0 bg-transparent border-none text-center cursor-pointer
                  ${variant === 'scroll' ? 'w-[calc((100%-2rem)/4.4)] flex-none snap-start' : ''}`}
    >
      <span className="relative block aspect-square rounded-xl border border-white/10 bg-[#0a0a0e] overflow-hidden
                       transition-colors group-hover:border-infrared/40">
        {p.avatar ? (
          <img src={p.avatar} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <span className={`w-full h-full flex items-center justify-center text-2xl font-bold text-white
                            font-space-grotesk ${getAvatarClass(p.role)}`}>
            {(p.name || '?').charAt(0).toUpperCase()}
          </span>
        )}
        {withRoleChip && roleChip(p.role)}
        {overlayCount ? (
          <span className="absolute inset-0 flex items-center justify-center bg-black/60
                           text-xl font-bold text-white font-space-grotesk">
            +{overlayCount}
          </span>
        ) : null}
      </span>
      <span className={`block mt-1.5 font-medium text-white truncate ${variant === 'scroll' ? 'text-[11px]' : 'text-xs'}`}>
        {p.name}
      </span>
    </button>
  );

  if (variant === 'scroll') {
    const overflows = list.length > 4;
    const onScroll = (e) => {
      const el = e.currentTarget;
      setScrolledToEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
    };
    return (
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={overflows ? onScroll : undefined}
          className="flex gap-2 overflow-x-auto snap-x pb-1
                     [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {list.map((p) => renderTile(p, 0, true))}
        </div>
        {/* right-edge fade: signals more content, gone once fully scrolled */}
        {overflows && !scrolledToEnd && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-10
                       bg-gradient-to-l from-black/80 to-transparent"
          />
        )}
      </div>
    );
  }

  const extras = list.slice(3);

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {list.slice(0, 3).map((p, i) =>
          renderTile(p, i === 2 && extras.length > 0 && !expanded ? extras.length : 0, false)
        )}
      </div>

      {/* Inline drawer with the remaining profiles */}
      {extras.length > 0 && (
        <div className={`overflow-hidden transition-[max-height] duration-300 ${expanded ? 'max-h-[1200px]' : 'max-h-0'}`}>
          <div className="grid grid-cols-3 gap-2 pt-2">
            {extras.map((p) => renderTile(p, 0, false))}
          </div>
        </div>
      )}
      {expanded && (
        <button
          type="button"
          className="mt-2 bg-transparent border-none p-0 text-infrared text-xs cursor-pointer hover:underline"
          onClick={() => setExpanded(false)}
        >
          {t('profile.seeLess')}
        </button>
      )}
    </div>
  );
};

export default ProfileMiniGrid;
