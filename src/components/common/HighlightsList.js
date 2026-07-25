import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

export const RA_URL_RE = /^https:\/\/(www\.)?(ra\.co|residentadvisor\.net)\//i;

// White "RA" wordmark on transparent — inline SVG text (Space Grotesk is
// already loaded), no boxed background. The blocky RA_LOGO_WHITE PNG read
// as white blocks at this size.
const RAMark = () => (
  <svg width="20" height="12" viewBox="0 0 26 14" aria-hidden="true" className="block">
    <text
      x="0"
      y="12"
      fill="currentColor"
      fontFamily="'Space Grotesk', sans-serif"
      fontWeight="700"
      fontSize="13.5"
      letterSpacing="0.5"
    >
      RA
    </text>
  </svg>
);

// Past-highlights dot-rows shared by ProfileScreen/ViewProfileScreen: shows
// three rows, the rest expand inline (same drawer pattern as the galleries
// and network strips) with a "See more"/"See less" toggle. Entries with a
// Resident Advisor link get the RA mark, opening the event page.
const HighlightsList = ({ highlights }) => {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const list = Array.isArray(highlights) ? highlights : [];
  if (list.length === 0) return null;

  const extras = list.slice(3);

  const row = (h, i) => (
    <div key={i} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0a0a0e] px-4 py-2.5">
      <span className="w-1.5 h-1.5 rounded-full bg-infrared shrink-0" />
      <span className="flex-1 text-sm text-white truncate">
        {h.venue}
        {(h.artist || h.city) && (
          <span className="text-white/40"> · {[h.artist, h.city].filter(Boolean).join(' · ')}</span>
        )}
      </span>
      {h.raUrl && RA_URL_RE.test(h.raUrl) && (
        <a
          href={h.raUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Resident Advisor"
          className="shrink-0 flex items-center text-white/60 hover:text-white transition-colors"
        >
          <RAMark />
        </a>
      )}
      {h.year && <span className="text-[11px] text-white/40 font-tech shrink-0">{h.year}</span>}
    </div>
  );

  return (
    <div>
      <div className="flex flex-col gap-2">
        {list.slice(0, 3).map(row)}
      </div>
      {extras.length > 0 && (
        <div className={`overflow-hidden transition-[max-height] duration-300 ${expanded ? 'max-h-[1600px]' : 'max-h-0'}`}>
          <div className="flex flex-col gap-2 pt-2">
            {extras.map((h, j) => row(h, j + 3))}
          </div>
        </div>
      )}
      {extras.length > 0 && (
        <button
          type="button"
          className="mt-2 bg-transparent border-none p-0 text-infrared text-xs cursor-pointer hover:underline"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? t('profile.seeLess') : t('profile.seeMore')}
        </button>
      )}
    </div>
  );
};

export default HighlightsList;
