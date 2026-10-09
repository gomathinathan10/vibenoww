import React from 'react';
import { Phone, Mail, MapPin, ArrowUpRight, ShieldCheck, Heart, Globe } from 'lucide-react';

export const Footer = ({ onNavigate, onOpenRegister }) => {
  return (
    <footer style={{ background: '#080b11', color: '#fff', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '70px', paddingBottom: '30px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', marginBottom: '50px' }}>
          
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <img src="/images/vibenoww-logo.png?v=2" alt="VibeNoww Logo" className="footer--logo-image" style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'contain', border: '1.5px solid rgba(0,210,255,0.5)', boxShadow: '0 0 20px rgba(0,210,255,0.3)', margin: 0 }} />
              <div>
                <div className="logo-brand">
                  <span className="logo-vibe" style={{ color: '#fff' }}>VIBE</span>
                  <span className="logo-now">NOWW</span>
                  <span className="logo-dot">.</span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>Where Your Vibe Finds Its People</div>
              </div>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.7', marginBottom: '20px' }}>
              Where Your Vibe Finds Its People. Connecting exceptional creative professionals with visionary clients worldwide.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="header-icon-btn" style={{ border: '1px solid rgba(255,255,255,0.1)', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-brands fa-instagram" style={{ fontSize: '16px' }}></i>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="header-icon-btn" style={{ border: '1px solid rgba(255,255,255,0.1)', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-brands fa-youtube" style={{ fontSize: '16px' }}></i>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="header-icon-btn" style={{ border: '1px solid rgba(255,255,255,0.1)', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-brands fa-facebook" style={{ fontSize: '16px' }}></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '20px', fontFamily: 'var(--font-sans)', fontWeight: '700' }}>Explore</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <a href="#/portfolio" onClick={(e) => { e.preventDefault(); onNavigate('portfolio'); }} style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Moments</span> <ArrowUpRight size={14} />
                </a>
              </li>
              <li>
                <a href="#/services" onClick={(e) => { e.preventDefault(); onNavigate('services'); }} style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Business</span> <ArrowUpRight size={14} />
                </a>
              </li>
              <li>
                <a href="#/select-photographers" onClick={(e) => { e.preventDefault(); onNavigate('select-photographers'); }} style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Select Photographers</span> <ArrowUpRight size={14} />
                </a>
              </li>
              <li>
                <a href="#/about" onClick={(e) => { e.preventDefault(); onNavigate('about'); }} style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>About VibeNoww</span> <ArrowUpRight size={14} />
                </a>
              </li>
              <li>
                <a href="#/admin" onClick={(e) => { e.preventDefault(); onNavigate('admin'); }} style={{ color: '#556987', fontSize: '0.85rem' }}>
                  <span>Admin Portal</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Creators */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '20px', fontFamily: 'var(--font-sans)', fontWeight: '700' }}>Creators</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <li>
                <a href="#/dashboard" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }} style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  Creator Dashboard
                </a>
              </li>
              <li>
                <a href="#/how-it-works" onClick={(e) => { e.preventDefault(); onNavigate('about'); }} style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  Verification Standard
                </a>
              </li>
            </ul>
            <button
              className="btn btn-gold btn-sm"
              onClick={onOpenRegister}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <ShieldCheck size={16} /> Join as Verified Creator
            </button>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '20px', fontFamily: 'var(--font-sans)', fontWeight: '700' }}>Get in Touch</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', color: '#94a3b8' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <MapPin size={18} style={{ color: 'var(--color-gold-warm)', flexShrink: 0, marginTop: '3px' }} />
                <span>Balabackiya Nagar, Thachanallur, Tirunelveli</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Phone size={18} style={{ color: 'var(--color-gold-warm)', flexShrink: 0 }} />
                <a href="tel:+917708320321" style={{ color: '#fff' }}>+91 7708320321</a>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Mail size={18} style={{ color: 'var(--color-gold-warm)', flexShrink: 0 }} />
                <a href="mailto:vibenoww26@gmail.com" style={{ color: '#fff' }}>vibenoww26@gmail.com</a>
              </div>
            </div>
          </div>

        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px', color: '#64748b', fontSize: '0.85rem' }}>
          <div>
            © {new Date().getFullYear()} VibeNoww Creative Network. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span>Made with <Heart size={13} style={{ color: '#e5b842', display: 'inline', verticalAlign: 'middle' }} /> for South Indian visual storytellers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
