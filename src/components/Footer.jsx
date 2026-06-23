"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "./Logo";
import "../styles/footer.scss";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const [year, setYear] = useState(2026);
  useEffect(() => {
    setTimeout(() => {
      setYear(new Date().getFullYear());
    }, 0);
  }, []);

  return (
    <footer className="global-footer">
      <div className="footer-container">
        {/* Brand & Newsletter section */}
        <div className="footer-brand-section">
          <Link href="/" className="footer-logo-link">
            <Logo width="70px" height="auto" />
          </Link>
          <p className="brand-desc">
            Threaded with elegance. Handcrafted tailoring made in our workshop with premium textiles.
          </p>

          <form onSubmit={handleSubscribe} className="newsletter-form">
            <h4 className="newsletter-title">Subscribe to the Needle Journal</h4>
            <div className="newsletter-input-group">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-submit-btn">
                {subscribed ? "Subscribed ✓" : "Subscribe"}
              </button>
            </div>
          </form>
        </div>

        {/* Link grids */}
        <div className="footer-links-grid">
          <div className="links-column">
            <h4 className="column-title">Collections</h4>
            <Link href="/shop?category=Dresses" className="column-link">Dresses</Link>
            <Link href="/shop?category=Outerwear" className="column-link">Outerwear</Link>
            <Link href="/shop?category=Knitwear" className="column-link">Knitwear</Link>
            <Link href="/shop?category=Tops" className="column-link">Tops</Link>
          </div>

          <div className="links-column">
            <h4 className="column-title">Needle House</h4>
            <Link href="/shop" className="column-link">Our Story</Link>
            <Link href="/shop" className="column-link">The Workshop</Link>
            <Link href="/shop" className="column-link">Artisans</Link>
            <Link href="/shop" className="column-link">Sustainability</Link>
          </div>

          <div className="links-column">
            <h4 className="column-title">Assistance</h4>
            <Link href="/shop" className="column-link">Size Guidelines</Link>
            <Link href="/shop" className="column-link">Shipping & Returns</Link>
            <Link href="/shop" className="column-link">Order Status</Link>
            <Link href="/shop" className="column-link">Contact Us</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p className="copyright-text">
            © {year} Needle Fashion Ltd. All rights reserved.
          </p>
          <div className="social-links">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">Instagram</a>
            <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="social-link">Pinterest</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
