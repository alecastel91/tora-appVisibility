import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useLanguage } from '../../contexts/LanguageContext';
// `new URL('pdfjs-dist/...', import.meta.url)` does NOT resolve bare package
// specifiers in Vite — it produced /src/components/common/pdfjs-dist/... which
// the dev server answered with index.html (SPA fallback, 200 + text/html).
// pdf.js then tried to run HTML as its worker and <Document> threw
// "Something went wrong". `?url` is the pattern Vite resolves properly, in
// dev and in the build.
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

const PdfViewer = ({ url, onLoaded }) => {
  const { t } = useLanguage();
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const [pageWidth, setPageWidth] = useState(800);
  const loadedFiredRef = useRef(false);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setPageWidth(Math.min(containerRef.current.clientWidth - 16, 1100));
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full overflow-auto flex flex-col items-center py-2 bg-[#08080b]"
    >
      <div
        className="sticky top-0 z-[5] flex gap-2 px-2.5 py-1.5 mb-2 rounded-full
                   border border-white/10 bg-[#101015]/90 backdrop-blur-md"
      >
        <button
          type="button"
          onClick={() => setScale(s => Math.max(0.5, s - 0.25))}
          className="w-8 h-7 rounded-xl border border-white/15 bg-transparent text-white
                     cursor-pointer transition-colors hover:border-infrared/40"
          aria-label={t('common.zoomOut')}
        >
          −
        </button>
        <span className="self-center min-w-[38px] text-center text-xs text-white/70 font-tech tabular-nums">
          {Math.round(scale * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setScale(s => Math.min(3, s + 0.25))}
          className="w-8 h-7 rounded-xl border border-white/15 bg-transparent text-white
                     cursor-pointer transition-colors hover:border-infrared/40"
          aria-label={t('common.zoomIn')}
        >
          +
        </button>
      </div>

      {error ? (
        <div className="px-6 py-6 text-center text-sm text-infrared">
          {t('docs.pdfLoadFailed')}
        </div>
      ) : (
        <Document
          file={url}
          onLoadSuccess={({ numPages: n }) => {
            setNumPages(n);
            if (!loadedFiredRef.current) {
              loadedFiredRef.current = true;
              if (onLoaded) onLoaded();
            }
          }}
          onLoadError={(e) => setError(e)}
          loading={<div className="px-6 py-6 text-sm text-white/40">{t('common.loading')}</div>}
        >
          {Array.from({ length: numPages || 0 }, (_, i) => (
            <div key={i + 1} className="mb-2 shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
              <Page
                pageNumber={i + 1}
                width={pageWidth}
                scale={scale}
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
            </div>
          ))}
        </Document>
      )}
    </div>
  );
};

export default PdfViewer;
