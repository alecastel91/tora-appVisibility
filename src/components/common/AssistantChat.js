import React, { useState, useRef, useEffect } from 'react';
import apiService from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAppContext } from '../../contexts/AppContext';

/**
 * TORA Assistant — floating concierge chat. Answers "how do I…" questions
 * grounded on the backend's app guide. Self-hides when the backend reports
 * the feature unconfigured (503), same pattern as translation.
 */
const AssistantChat = () => {
  const { t } = useLanguage();
  const { user } = useAppContext();
  const [open, setOpen] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [limitHit, setLimitHit] = useState(false);
  const bodyRef = useRef(null);

  // Per-user session transcript so reopening keeps context (session only).
  const storeKey = user?.id ? `tora:assistant:${user.id}` : null;
  useEffect(() => {
    if (!storeKey) return;
    try {
      const saved = sessionStorage.getItem(storeKey);
      setMessages(saved ? JSON.parse(saved) : []);
    } catch { setMessages([]); }
  }, [storeKey]);
  useEffect(() => {
    if (storeKey) try { sessionStorage.setItem(storeKey, JSON.stringify(messages.slice(-30))); } catch { /* full */ }
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, storeKey, open, busy]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const res = await apiService.assistantChat(next.slice(-12));
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (error) {
      const status = error.response?.status;
      if (status === 503) { setUnavailable(true); setOpen(false); return; }
      if (status === 429) { setLimitHit(true); return; }
      setMessages((prev) => [...prev, { role: 'assistant', content: t('assistant.error') }]);
    } finally {
      setBusy(false);
    }
  };

  if (!user || unavailable) return null;

  return (
    <>
      <button
        type="button"
        className="assistant-fab"
        aria-label={t('assistant.title')}
        onClick={() => setOpen(true)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          <path d="M9.5 9a2.5 2.5 0 0 1 4.86.82c0 1.67-2.5 2.5-2.5 2.5" />
          <circle cx="11.9" cy="15.5" r="0.4" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div className="assistant-overlay" onClick={() => setOpen(false)}>
          <div className="assistant-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="assistant-header">
              <div>
                <p className="assistant-title">{t('assistant.title')}</p>
                <p className="assistant-subtitle">{t('assistant.subtitle')}</p>
              </div>
              <button className="modal-close" onClick={() => setOpen(false)}>×</button>
            </div>
            <div className="assistant-body" ref={bodyRef}>
              {messages.length === 0 && (
                <div className="assistant-msg assistant-msg-bot">{t('assistant.intro')}</div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`assistant-msg ${m.role === 'user' ? 'assistant-msg-user' : 'assistant-msg-bot'}`}>
                  {m.content}
                </div>
              ))}
              {busy && <div className="assistant-msg assistant-msg-bot assistant-typing">···</div>}
              {limitHit && <div className="assistant-msg assistant-msg-bot">{t('assistant.limitReached')}</div>}
            </div>
            <div className="assistant-input-row">
              <input
                type="text"
                className="form-input"
                placeholder={t('assistant.placeholder')}
                value={input}
                disabled={busy || limitHit}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
              />
              <button className="btn btn-primary btn-small" disabled={busy || limitHit || !input.trim()} onClick={send}>
                {t('assistant.send')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssistantChat;
