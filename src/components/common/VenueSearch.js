import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import apiService from '../../services/api';

/**
 * Venue autocomplete for the Make Offer form (CitySearch UX): type a name,
 * matching TORA VENUE profiles drop down; picking one links the deal to that
 * venue. Free text stays valid — it just doesn't link a profile.
 *
 * onSelect(venueName, venueId) — venueId is null while the text is free-form.
 */
const VenueSearch = ({ venueName, venueId, onSelect }) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState(venueName || '');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const latestRef = useRef(0);
  const boxRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const runSearch = (v) => {
    setQuery(v);
    onSelect(v, null); // typing keeps the name but unlinks any prior pick
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const term = v.trim();
    if (term.length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setOpen(true);
    const requestId = ++latestRef.current;
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await apiService.lookupVenues(term);
        if (latestRef.current !== requestId) return;
        setResults(data.venues || []);
      } catch (e) {
        if (latestRef.current === requestId) setResults([]);
      } finally {
        if (latestRef.current === requestId) setLoading(false);
      }
    }, 220);
  };

  const pick = (v) => {
    onSelect(v.name, v.id, v); // pass the full result so callers can prefill capacity/rooms/location
    setQuery(v.name);
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="w-full relative">
      <input
        type="text"
        className="form-input"
        value={query}
        onChange={(e) => runSearch(e.target.value)}
        onFocus={() => { if (results.length) setOpen(true); }}
        placeholder={t('offer.searchVenuePlaceholder')}
        autoComplete="off"
        required
      />
      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-xl border border-white/10 bg-[#0f0f11] max-h-64 overflow-y-auto text-left shadow-xl">
          {loading && <div className="px-4 py-3 text-sm text-white/40">…</div>}
          {!loading && results.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => pick(v)}
              className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 text-sm bg-transparent border-none cursor-pointer hover:bg-white/5 transition-colors"
            >
              <span className="w-7 h-7 rounded-full overflow-hidden bg-[#1a1a1f] shrink-0 flex items-center justify-center text-[11px] font-semibold text-white">
                {v.avatar
                  ? <img src={v.avatar} alt="" className="w-full h-full object-cover" />
                  : (v.name || '?').charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="block text-white truncate">{v.name}</span>
                {(v.city || v.location) && (
                  <span className="block text-[11px] text-white/40 truncate">{v.location || v.city}</span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
      {venueId && (
        <p className="m-0 mt-2 text-[10px] uppercase tracking-[0.15em] text-infrared/80 font-tech">
          ✓ {t('offer.toraVenueLinked')}
        </p>
      )}
    </div>
  );
};

export default VenueSearch;
