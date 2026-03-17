import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const IntroSplash = ({ onComplete }) => {
  const [showLogo, setShowLogo] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [hideTagline, setHideTagline] = useState(false);
  const [slideUp, setSlideUp] = useState(false);

  useEffect(() => {
    // Logo animates in first
    const logoTimer = setTimeout(() => setShowLogo(true), 300);
    // Tagline appears shortly after logo
    const taglineTimer = setTimeout(() => setShowTagline(true), 800);
    // Tagline starts to disappear at 2.3 seconds
    const hideTaglineTimer = setTimeout(() => setHideTagline(true), 2300);
    // Logo slides up after 2.6 seconds (after tagline fades)
    const slideTimer = setTimeout(() => {
      setSlideUp(true);
    }, 2600);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(taglineTimer);
      clearTimeout(hideTaglineTimer);
      clearTimeout(slideTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
      <div className="flex flex-col items-center text-center">
        {/* Logo - slides up and shrinks */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
          animate={
            showLogo
              ? {
                  opacity: slideUp ? 0 : 1, // Fade out when sliding up
                  scale: slideUp ? 0.625 : 1, // Shrinks to login size (200/320 = 0.625)
                  filter: 'blur(0px)',
                  y: slideUp ? -280 : 0 // Slides up higher to match login position
                }
              : {}
          }
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-2"
        >
          <img
            src="/tora_logo.png"
            alt="TORA"
            className="w-[320px] md:w-[400px] h-auto"
          />
        </motion.div>

        {/* Tagline - fades out before logo slides */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={
            showTagline
              ? { opacity: hideTagline ? 0 : 1, y: 0 }
              : {}
          }
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="text-center mt-2"
        >
          <p className="text-white text-[10px] md:text-[12px] tracking-[0.22em] font-normal uppercase whitespace-nowrap">
            WHERE MUSIC MEETS
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default IntroSplash;
