import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * The written guide — what the help icon opens.
 *
 * Deliberately the FIRST thing a member sees when they need help, with the
 * Assistant offered underneath rather than instead. A chat box as the only
 * entry point invites people to ask it things it should not be asked, costs a
 * model call for questions a paragraph answers better, and leaves nothing to
 * read when they would rather just look something up.
 *
 * Content lives in the translation files under `guide` (chapters → entries), so
 * it translates like everything else and a locale that lacks a chapter falls
 * back to English rather than showing an empty screen.
 */
const ChevronDown = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round"
       className={`w-4 h-4 shrink-0 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`}
       aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const SearchGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
    <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const GuideScreen = ({ onClose }) => {
  const { t, language } = useLanguage();
  const [openChapter, setOpenChapter] = useState(null);
  const [query, setQuery] = useState('');
  const [openEntry, setOpenEntry] = useState(null);

  // t() returns whatever the key holds, so an array of chapters comes back
  // whole. Re-read when the language chunk arrives.
  const chapters = useMemo(() => {
    const c = t('guide.chapters');
    return Array.isArray(c) ? c : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const q = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!q) return null;
    const out = [];
    for (const ch of chapters) {
      for (const e of ch.entries || []) {
        if (`${e.q} ${e.a}`.toLowerCase().includes(q)) out.push({ ...e, chapter: ch.title });
      }
    }
    return out;
  }, [q, chapters]);

  const openAssistant = () => {
    onClose && onClose();
    // Let the screen unmount before the chat opens, so the two overlays never
    // fight over the same space.
    setTimeout(() => window.dispatchEvent(new CustomEvent('tora:open-assistant')), 0);
  };

  const Entry = ({ entry, id }) => {
    const open = openEntry === id;
    return (
      <div className="rounded-xl border border-white/10 bg-[#0a0a0e] overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenEntry(open ? null : id)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer
                     transition-colors hover:bg-white/[0.03]"
        >
          <span className="text-sm text-white">{entry.q}</span>
          <ChevronDown open={open} />
        </button>
        {open && (
          <p className="m-0 px-4 pb-4 text-[13px] leading-relaxed text-white/60">{entry.a}</p>
        )}
      </div>
    );
  };

  const AssistantBanner = () => (
    <div className="mt-6 rounded-2xl border border-infrared/30 bg-infrared/[0.06] p-4">
      <p className="m-0 text-sm font-semibold text-white font-space-grotesk">{t('guide.assistant.title')}</p>
      <p className="mt-1.5 mb-0 text-[13px] leading-relaxed text-white/55">{t('guide.assistant.body')}</p>
      <button type="button" onClick={openAssistant} className="btn btn-primary mt-3.5 px-5">
        {t('guide.assistant.cta')}
      </button>
    </div>
  );

  const SupportNote = () => (
    <div className="mt-3 rounded-2xl border border-white/10 bg-[#0a0a0e] p-4">
      <p className="m-0 text-sm font-semibold text-white/80">{t('guide.support.title')}</p>
      <p className="mt-1.5 mb-0 text-[13px] leading-relaxed text-white/50">{t('guide.support.body')}</p>
    </div>
  );

  const chapter = chapters.find((c) => c.id === openChapter);

  return createPortal(
    <div className="screen active fixed inset-0 z-[10040] overflow-y-auto bg-[#050507]">
      <div className="sub-screen-header">
        <button
          type="button"
          className="back-btn"
          onClick={() => (chapter ? setOpenChapter(null) : onClose && onClose())}
          aria-label={t('common.back')}
        >
          ‹
        </button>
        <h1>{chapter ? chapter.title : t('guide.title')}</h1>
      </div>

      <div className="mx-auto w-full max-w-2xl px-5 pb-16 pt-2">
        {!chapter && (
          <>
            <p className="mt-0 mb-4 text-[13px] leading-relaxed text-white/50">{t('guide.subtitle')}</p>

            <label className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#0a0a0e] px-3.5 py-2.5">
              <span className="text-white/35"><SearchGlyph /></span>
              <input
                type="search"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpenEntry(null); }}
                placeholder={t('guide.searchPlaceholder')}
                className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none border-0"
              />
            </label>

            {matches ? (
              <div className="mt-4 flex flex-col gap-2">
                {matches.length === 0 ? (
                  <p className="py-8 text-center text-sm text-white/40">{t('guide.noResults')}</p>
                ) : (
                  <>
                    <p className="m-0 mb-1 text-[10px] uppercase tracking-[0.2em] text-white/35 font-tech">
                      {t('guide.resultsFor', { n: matches.length })}
                    </p>
                    {matches.map((e, i) => (
                      <div key={`${e.q}-${i}`}>
                        <p className="m-0 mb-1 text-[10px] uppercase tracking-[0.15em] text-white/30 font-tech">
                          {e.chapter}
                        </p>
                        <Entry entry={e} id={`search-${i}`} />
                      </div>
                    ))}
                  </>
                )}
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-2">
                {chapters.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { setOpenChapter(c.id); setOpenEntry(null); }}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-[#0a0a0e]
                               px-4 py-3.5 text-left cursor-pointer transition-colors hover:border-infrared/40"
                  >
                    <span className="w-6 shrink-0 text-[11px] font-tech text-infrared/70 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-white">{c.title}</span>
                      <span className="block text-[10px] uppercase tracking-[0.15em] text-white/35 font-tech">
                        {t('guide.entryCount', { n: (c.entries || []).length })}
                      </span>
                    </span>
                    <span className="shrink-0 text-white/25" aria-hidden="true">›</span>
                  </button>
                ))}
              </div>
            )}

            <AssistantBanner />
            <SupportNote />
          </>
        )}

        {chapter && (
          <>
            <button
              type="button"
              onClick={() => setOpenChapter(null)}
              className="mb-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-tech
                         bg-transparent border-0 p-0 cursor-pointer hover:text-white/70"
            >
              ‹ {t('guide.backToIndex')}
            </button>
            <div className="flex flex-col gap-2">
              {(chapter.entries || []).map((e, i) => (
                <Entry key={`${chapter.id}-${i}`} entry={e} id={`${chapter.id}-${i}`} />
              ))}
            </div>
            <AssistantBanner />
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default GuideScreen;
