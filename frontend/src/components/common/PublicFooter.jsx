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
              {['instagram', 'twitter-x', 'linkedin', 'facebook'].map(s => (
                <a key={s} href="#" aria-label={s}><i className={`bi bi-${s}`} /></a>
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
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/membership">Membership</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <span className="footer-head">Contact</span>
            <div className="footer-contact">
              <a href="tel:+254700000000"><i className="bi bi-telephone" />+254 700 000 000</a>
              <a href="mailto:ops@nairobijethouse.com"><i className="bi bi-envelope" />ops@nairobijethouse.com</a>
              <a href="#"><i className="bi bi-geo-alt" />Wilson Airport, Nairobi, Kenya</a>
              <a href="#"><i className="bi bi-clock" />24 / 7 Concierge Available</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} NairobiJetHouse. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}