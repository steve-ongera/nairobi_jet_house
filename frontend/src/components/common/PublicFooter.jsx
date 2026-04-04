import React from 'react';
import { Link } from 'react-router-dom';

export default function PublicFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link to="/" className="footer-logo">Nairobi<span>Jet</span>House</Link>
            <p>
              Africa's premier private aviation and luxury charter platform. We connect
              discerning travellers with world-class aircraft and superyachts, delivering
              bespoke intercontinental experiences on every journey.
            </p>
            <div className="footer-social" style={{ marginTop: '1.25rem' }}>
              {[
                { icon: 'instagram', href: 'https://instagram.com/nairobijethouse', label: 'Instagram' },
                { icon: 'twitter-x', href: 'https://twitter.com/nairobijethouse', label: 'Twitter / X' },
                { icon: 'linkedin',  href: 'https://linkedin.com/company/nairobijethouse', label: 'LinkedIn' },
                { icon: 'facebook',  href: 'https://facebook.com/nairobijethouse', label: 'Facebook' },
              ].map(({ icon, href, label }) => (
                <a key={icon} href={href} aria-label={label} target="_blank" rel="noopener noreferrer" className="social-icon">
                  <i className={`bi bi-${icon}`} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <span className="footer-head">Charter</span>
            <ul className="footer-links">
              <li><Link to="/fleet">Private Jets</Link></li>
              <li><Link to="/yachts">Yacht Charter</Link></li>
              <li><Link to="/book-flight">Book a Flight</Link></li>
              <li><Link to="/book-yacht">Book a Yacht</Link></li>
              <li><Link to="/track">Track Booking</Link></li>
            </ul>
          </div>

          <div>
            <span className="footer-head">Company</span>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/membership">Membership</Link></li>
              <li><Link to="/air-cargo">Air Cargo</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <span className="footer-head">Contact</span>
            <div className="footer-contact">
              <a href="tel:+254724878136" className="footer-contact-link">
                <i className="bi bi-telephone" />+254 724 878 136
              </a>
              <a href="mailto:nairobijethouse@gmail.com" className="footer-contact-link">
                <i className="bi bi-envelope" />nairobijethouse@gmail.com
              </a>
              <a
                href="https://maps.google.com/?q=Wilson+Airport+Nairobi+Kenya"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-link"
              >
                <i className="bi bi-geo-alt" />Wilson Airport, Nairobi, Kenya
              </a>
              <a href="https://wa.me/254724878136" target="_blank" rel="noopener noreferrer" className="footer-contact-link">
                <i className="bi bi-whatsapp" />WhatsApp Us
              </a>
              <span className="footer-contact-info">
                <i className="bi bi-clock" />24 / 7 Concierge Available
              </span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} NairobiJetHouse. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link to="/privacy-policy" className="footer-bottom-link">Privacy Policy</Link>
            <Link to="/terms-of-service" className="footer-bottom-link">Terms of Service</Link>
            <Link to="/cookie-policy" className="footer-bottom-link">Cookie Policy</Link>
          </div>
        </div>
      </div>

      <style>{`
        /* ── Nav links (Charter & Company columns) ── */
        .footer-links li a {
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-size: 0.875rem;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.15rem 0;
          position: relative;
          transition: color 0.2s ease;
        }

        .footer-links li a::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--gold, #c9a84c);
          transition: width 0.25s ease;
        }

        .footer-links li a:hover {
          color: var(--gold, #c9a84c);
        }

        .footer-links li a:hover::after {
          width: 100%;
        }

        /* ── Contact links ── */
        .footer-contact-link {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-size: 0.875rem;
          padding: 0.25rem 0;
          transition: color 0.2s ease, gap 0.2s ease;
          cursor: pointer;
        }

        .footer-contact-link i {
          color: var(--gold, #c9a84c);
          font-size: 0.9rem;
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }

        .footer-contact-link:hover {
          color: var(--gold, #c9a84c);
          gap: 0.8rem;
        }

        .footer-contact-link:hover i {
          transform: scale(1.15);
        }

        /* Non-clickable contact row (e.g. hours) */
        .footer-contact-info {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
          padding: 0.25rem 0;
        }

        .footer-contact-info i {
          color: var(--gold, #c9a84c);
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        /* ── Social icons ── */
        .social-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-size: 0.95rem;
          transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
        }

        .social-icon:hover {
          color: var(--gold, #c9a84c);
          border-color: var(--gold, #c9a84c);
          background: rgba(201, 168, 76, 0.08);
          transform: translateY(-2px);
        }

        /* ── Footer logo ── */
        .footer-logo {
          text-decoration: none;
          transition: opacity 0.2s ease;
        }

        .footer-logo:hover {
          opacity: 0.85;
        }

        /* ── Bottom bar links ── */
        .footer-bottom-link {
          color: rgba(255, 255, 255, 0.45);
          text-decoration: none;
          font-size: 0.8rem;
          transition: color 0.2s ease;
          position: relative;
        }

        .footer-bottom-link::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--gold, #c9a84c);
          transition: width 0.25s ease;
        }

        .footer-bottom-link:hover {
          color: var(--gold, #c9a84c);
        }

        .footer-bottom-link:hover::after {
          width: 100%;
        }
      `}</style>
    </footer>
  );
}