import React, { useState, useRef, useEffect } from 'react';
import apiService from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAppContext } from '../../contexts/AppContext';

/**
 * TORA Assistant — floating concierge chat. Answers "how do I…" questions
 * grounded on the backend's app guide. Self-hides when the backend reports
 * the feature unconfigured (503), same pattern as translation.
 */
// Minimal safe renderer for the assistant's limited formatting: preserves
// line structure (pre-wrap does the rest) and turns **text** into <strong>.
// No HTML injection — everything stays React text nodes.
const renderAssistantText = (text) =>
  String(text).split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );

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

  // Opened from the header icon (between notifications and badges).
  useEffect(() => {
    const openIt = () => setOpen(true);
    window.addEventListener('tora:open-assistant', openIt);
    return () => window.removeEventListener('tora:open-assistant', openIt);
  }, []);

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
      const res = await apiService.assistantChat(next.slice(-12), user?.id);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (error) {
      const status = error.response?.status;
      if (status === 503) { setUnavailable(true); return; }
      if (status === 429) { setLimitHit(true); return; }
      setMessages((prev) => [...prev, { role: 'assistant', content: t('assistant.error') }]);
    } finally {
      setBusy(false);
    }
  };

  if (!user) return null;

  return (
    <>
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
                  {m.role === 'assistant' ? renderAssistantText(m.content) : m.content}
                </div>
              ))}
              {busy && <div className="assistant-msg assistant-msg-bot assistant-typing">···</div>}
              {limitHit && <div className="assistant-msg assistant-msg-bot">{t('assistant.limitReached')}</div>}
              {unavailable && <div className="assistant-msg assistant-msg-bot">{t('assistant.unavailable')}</div>}
            </div>
            <div className="assistant-input-row">
              <input
                type="text"
                className="form-input"
                placeholder={t('assistant.placeholder')}
                value={input}
                disabled={busy || limitHit || unavailable}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
              />
              <button className="btn btn-primary btn-small" disabled={busy || limitHit || unavailable || !input.trim()} onClick={send}>
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
