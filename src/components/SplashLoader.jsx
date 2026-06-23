"use client";

import React, { useState, useEffect } from "react";
import "../styles/splashloader.scss";

export default function SplashLoader() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the splash screen in this session
    const hasSeenSplash = sessionStorage.getItem("needle_seen_splash");
    if (hasSeenSplash) {
      setTimeout(() => {
        setVisible(false);
      }, 0);
      return;
    }

    // Play splash animation
    const timerFade = setTimeout(() => {
      setFadeOut(true);
    }, 1800);

    const timerRemove = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("needle_seen_splash", "true");
    }, 2400);

    return () => {
      clearTimeout(timerFade);
      clearTimeout(timerRemove);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`splash-overlay ${fadeOut ? "fade-out" : ""}`}>
      <div className="splash-content">
        <h1 className="splash-logo">N E E D L E</h1>
        <div className="thread-container">
          <div className="thread-line"></div>
          <div className="needle-tip"></div>
        </div>
        <p className="splash-tagline">THREADED WITH ELEGANCE</p>
      </div>
    </div>
  );
}
