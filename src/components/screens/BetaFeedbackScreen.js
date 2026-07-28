import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import apiService from '../../services/api';
import { getAvatarClass, roleLabel } from '../../utils/roles';
import { useLanguage } from '../../contexts/LanguageContext';
import { CloseIcon } from '../../utils/icons';

// Beta-only tool: English-only by design (mirrors BetaTools — no i18n keys).
const PAGES = ['all', 'profile', 'search', 'news', 'tour', 'bookings', 'messages'];

const timeLabel = (iso) => {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
};

const initial = (name) => (name ? name.trim().charAt(0).toUpperCase() : '?');

const BetaFeedbackScreen = ({ onClose }) => {
  const { t } = useLanguage();
  const [items, setItems] = useState(null); // null = loading
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [lightbox, setLightbox] = useState(null);

  // The page/tab filter is applied server-side (?page=<tab>) so low-volume
  // tabs paginate correctly instead of a mixed page filtering down to empty.
  const load = useCallback(async () => {
    setError('');
    setItems(null);
    try {
      const res = await apiService.getAdminFeedback({ page: filter });
      setItems(res.items || []);
      setHasMore(!!res.hasMore);
      setNextCursor(res.nextCursor || null);
    } catch (e) {
      setError('Could not load feedback — try again.');
      setItems([]);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const loadMore = async () => {
    if (loadingMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const res = await apiService.getAdminFeedback({ before: nextCursor, page: filter });
      setItems((prev) => [...(prev || []), ...(res.items || [])]);
      setHasMore(!!res.hasMore);
      setNextCursor(res.nextCursor || null);
    } catch (e) {
      setError('Could not load more — try again.');
    } finally {
      setLoadingMore(false);
    }
  };

  // Escape closes the screenshot lightbox (added when it's open).
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  const visible = items || [];

  return (
    <div className="screen active px-5 pt-6 pb-8" style={{ backgroundColor: '#000' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-white font-space-grotesk tracking-[-0.02em] leading-none">
            Beta feedback
          </h2>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/40 font-tech">Tester submissions</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-transparent text-white/70 transition-colors hover:border-infrared/50 hover:text-infrared [&_svg]:h-4 [&_svg]:w-4"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Filter chips */}
      <div className="mb-5 flex flex-wrap gap-2">
        {PAGES.map((p) => {
          const on = filter === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => setFilter(p)}
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] font-tech transition-colors ${
                on
                  ? 'border-infrared/60 bg-infrared/10 text-infrared'
                  : 'border-white/12 bg-transparent text-white/50 hover:border-white/30 hover:text-white/80'
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* States */}
      {items === null && (
        <p className="py-10 text-center text-sm text-white/40">Loading…</p>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-infrared/40 bg-infrared/5 px-4 py-3 text-center text-sm text-infrared">
          {error}
        </div>
      )}
      {items !== null && visible.length === 0 && !error && (
        <p className="py-10 text-center text-sm text-white/40">
          {filter === 'all' ? 'No feedback yet' : `No feedback for “${filter}” yet`}
        </p>
      )}

      {/* List */}
      <div className="flex flex-col gap-3">
        {visible.map((f) => (
          <div
            key={f.id}
            className="rounded-2xl border border-white/10 bg-[#101015] p-4"
          >
            <div className="flex items-center gap-3">
              {f.author ? (
                f.author.avatar ? (
                  <img src={f.author.avatar} alt={f.author.name} className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white ${getAvatarClass(f.author.role)}`}>
                    {initial(f.author.name)}
                  </div>
                )
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-bold text-white/50">
                  ?
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">
                  {f.author ? f.author.name : 'Anonymous'}
                  {f.author && (
                    <span className="ml-2 text-[11px] font-normal text-white/40">{roleLabel(f.author.role, t)}</span>
                  )}
                  {!f.author && f.email && (
                    <span className="ml-2 text-[11px] font-normal text-white/40">{f.email}</span>
                  )}
                </div>
              </div>
              {f.page && (
                <span className="shrink-0 rounded-full border border-white/12 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/60 font-tech">
                  {f.page}
                </span>
              )}
            </div>

            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-white/85">{f.message}</p>

            {f.imageUrl && (
              <button
                type="button"
                onClick={() => setLightbox(f.imageUrl)}
                className="mt-3 block overflow-hidden rounded-xl border border-white/10"
              >
                <img src={f.imageUrl} alt="screenshot" className="max-h-48 w-auto object-cover" />
              </button>
            )}

            <div className="mt-3 text-[11px] text-white/35" title={new Date(f.createdAt).toLocaleString()}>
              {timeLabel(f.createdAt)}
            </div>
          </div>
        ))}
      </div>

      {/* Load more (server paginates within the active page filter) */}
      {items !== null && hasMore && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-full border border-white/15 px-5 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white/70 transition-colors hover:border-infrared/50 hover:text-infrared disabled:opacity-50 font-tech"
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="screenshot enlarged"
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Close"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white [&_svg]:h-4 [&_svg]:w-4"
          >
            <CloseIcon />
          </button>
        </div>,
        document.body,
      )}
    </div>
  );
};

export default BetaFeedbackScreen;
