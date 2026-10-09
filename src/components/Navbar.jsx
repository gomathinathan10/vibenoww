import React, { useState, useEffect } from 'react';
import { Menu, X, Sparkles, User, Camera, Calculator, LogOut } from 'lucide-react';
import { useData } from '../context/DataContext';

export const Navbar = ({
  activeTab,
  setActiveTab,
  onOpenRegister,
  onOpenCreatorLogin,
  onOpenEstimateModal,
  onOpenBookNow
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useData();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'browse', label: 'Home', hash: '#/' },
    { id: 'portfolio', label: 'Moments', hash: '#/portfolio' },
    { id: 'services', label: 'Business', hash: '#/services' },
    { id: 'select-photographers', label: 'Select Photographers', hash: '#/select-photographers' },
    { id: 'about', label: 'About', hash: '#/about' },
    { id: 'dashboard', label: 'Creators', hash: '#/dashboard' },
    { id: 'contact', label: 'Contact', hash: '#/contact' }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className={`header--navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        {/* Brand Logo */}
        <a href="#/" onClick={(e) => { e.preventDefault(); handleNavClick('browse'); }} className="header--logo">
          <img src="/images/vibenoww-logo.png?v=2" alt="VibeNoww" className="header--logo-image" style={{ objectFit: 'contain' }} />
          <div className="logo-brand">
            <span className="logo-vibe">VIBE</span>
            <span className="logo-now">NOWW</span>
            <span className="logo-dot">.</span>
          </div>
          <span className="logo-tagline">Where Your Vibe Finds Its People</span>
        </a>

        {/* Desktop and Mobile Navigation Links */}
        <nav>
          <ul className={`header--nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            {/* Mobile Drawer Brand Header */}
            <li className="mobile-drawer-header" style={{ display: 'none', paddingBottom: '16px', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/images/vibenoww-logo.png?v=2" alt="VibeNoww" style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'contain', border: '1.5px solid rgba(0,210,255,0.5)', boxShadow: '0 0 14px rgba(0,210,255,0.4)' }} />
                <div className="logo-brand" style={{ fontSize: '1.4rem' }}>
                  <span className="logo-vibe" style={{ color: '#fff' }}>VIBE</span>
                  <span className="logo-now">NOWW</span>
                  <span className="logo-dot">.</span>
                </div>
              </div>
            </li>
            {navItems.map((item) => (
              <li key={item.id} className={activeTab === item.id ? 'active' : ''}>
                <a
                  href={item.hash}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.id);
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}

            {/* Mobile-only CTA */}
            <li className="mobile-only" style={{ display: 'none', width: '100%', marginTop: '16px' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenEstimateModal();
                }}
              >
                <Calculator size={16} /> Get Instant Quote
              </button>
            </li>
          </ul>
        </nav>

        {/* Header Action Buttons */}
        <div className="header--actions">
          <button
            className="btn btn-outline-light btn-sm"
            onClick={onOpenEstimateModal}
            title="Instant Price Calculator"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Calculator size={15} style={{ color: 'var(--color-gold-warm)' }} />
            <span className="hide-on-mobile">Instant Quote</span>
          </button>

          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleNavClick('dashboard')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <User size={14} />
                <span>{currentUser.name ? currentUser.name.split(' ')[0] : 'Dashboard'}</span>
              </button>
              <button
                className="header-icon-btn"
                onClick={logout}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={onOpenCreatorLogin}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Camera size={14} />
              <span>Creator Login</span>
            </button>
          )}

          {/* Mobile Menu Toggle (Three-dot button) */}
          <button
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            title="Menu"
          >
            {mobileMenuOpen ? (
              <X size={22} />
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2.2" />
                <circle cx="12" cy="12" r="2.2" />
                <circle cx="12" cy="19" r="2.2" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
