import React, { useState } from 'react';
import apiService from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';

// A small "Translate" affordance for a profile bio. Reuses the same
// server-side translation the chat uses (apiService.translateMessage +
// a See-original toggle). Only renders for non-empty text. Hides itself
// for the rest of the session if the feature is unavailable (503, no
// DeepL key on the backend).
const BioTranslate = ({ text }) => {
  const { t, language } = useLanguage();
  const [state, setState] = useState({ loading: false, showing: false, text: null });
  const [unavailable, setUnavailable] = useState(false);

  if (!text || !text.trim()) return null;
  if (unavailable) return null;

  const handleTranslate = async () => {
    // Already fetched → just toggle between original and translation.
    if (state.text != null) {
      setState((prev) => ({ ...prev, showing: !prev.showing }));
      return;
    }
    if (state.loading) return;
    setState({ loading: true, showing: false, text: null });
    try {
      const res = await apiService.translateMessage(text, language);
      setState({ loading: false, showing: true, text: res.translatedText });
    } catch (err) {
      if (err?.response?.status === 503) {
        setUnavailable(true);
      }
      setState({ loading: false, showing: false, text: null });
    }
  };

  const isShowing = state.showing && state.text != null;

  return (
    <>
      {isShowing && (
        <p className="mt-2 text-sm leading-relaxed text-white/70 whitespace-pre-line">
          {state.text}
        </p>
      )}
      <button
        type="button"
        disabled={state.loading}
        onClick={handleTranslate}
        className="mt-2 bg-transparent border-none p-0 text-infrared/90 hover:text-infrared text-xs cursor-pointer hover:underline"
      >
        {state.loading ? t('chat.translating') : isShowing ? t('chat.showOriginal') : t('chat.translate')}
      </button>
    </>
  );
};

export default BioTranslate;
