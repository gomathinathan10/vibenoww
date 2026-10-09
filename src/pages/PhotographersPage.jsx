import React, { useState } from 'react';
import { Search, MapPin, Star, CheckCircle, Award, Sparkles, Filter, Check, Users } from 'lucide-react';
import { useData } from '../context/DataContext';

export const PhotographersPage = ({
  selectedCreators,
  setSelectedCreators,
  onViewProfile,
  onRequestPhotographer,
  onOpenMultiBooking,
  onNavigate,
  initialCategory = 'all',
  setActiveLightboxImg
}) => {
  const { publicApprovedPhotographers } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'price_low', 'price_high', 'experience'

  const cities = ['All', 'Tirunelveli', 'Chennai', 'Madurai', 'Coimbatore', 'Tenkasi', 'Kanyakumari'];
  const specialties = ['All', 'Wedding Photography', 'Candid', 'Drone Videography', 'Reel Editing', 'Fashion & Product', 'Maternity & Newborn'];

  const handleSearch = () => {
    setSearchTerm(searchInput.trim());
  };

  const toggleSelection = (photog) => {
    if (selectedCreators.some(c => c.id === photog.id)) {
      setSelectedCreators(selectedCreators.filter(c => c.id !== photog.id));
    } else {
      setSelectedCreators([...selectedCreators, photog]);
    }
  };

  const filteredPhotographers = publicApprovedPhotographers.filter((p) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term ||
      (p.name || '').toLowerCase().includes(term) ||
      (p.studioName || '').toLowerCase().includes(term) ||
      (p.title || '').toLowerCase().includes(term) ||
      (p.location || '').toLowerCase().includes(term) ||
      (p.city || '').toLowerCase().includes(term) ||
      (Array.isArray(p.specialties) && p.specialties.some(s => (s || '').toLowerCase().includes(term))) ||
      (Array.isArray(p.serviceAreas) && p.serviceAreas.some(s => (s || '').toLowerCase().includes(term))) ||
      (p.bio || '').toLowerCase().includes(term);

    const matchesCity = selectedCity === 'All' || p.location.toLowerCase().includes(selectedCity.toLowerCase());

    const matchesSpecialty = selectedSpecialty === 'All' ||
      (p.specialties && p.specialties.some(s => s.toLowerCase().includes(selectedSpecialty.toLowerCase())));

    return matchesSearch && matchesCity && matchesSpecialty;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'price_low') return (a.startingPrice || 0) - (b.startingPrice || 0);
    if (sortBy === 'price_high') return (b.startingPrice || 0) - (a.startingPrice || 0);
    if (sortBy === 'experience') return (b.experienceYears || 0) - (a.experienceYears || 0);
    return 0;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: 'var(--color-text-dark)', paddingTop: '90px', paddingBottom: '100px' }}>
      
      {/* Header Banner */}
      <section style={{ background: '#080b11', color: '#fff', padding: '50px 0 60px' }}>
        <div className="container">
          <div style={{ maxWidth: '720px' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)', fontWeight: '800', marginTop: '12px', marginBottom: '12px', color: '#fff' }}>
              Select Verified Photographers & Filmmakers
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: '1.6' }}>
              Browse portfolios, compare starting rates, review authentic client ratings, and book top wedding & commercial artists in Tirunelveli, Chennai, and South India.
            </p>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section style={{ background: 'var(--color-ivory)', borderBottom: '1px solid var(--color-border-subtle)', padding: '24px 0', position: 'sticky', top: '65px', zIndex: 90 }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
            
            {/* Search input & button */}
            <div style={{ display: 'flex', gap: '8px', flex: '1 1 320px', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', top: '12px', left: '14px', color: '#94a3b8' }} />
                <input
                  type="text"
                  id="creatives-search-input"
                  placeholder="Search by artist name, style, or city..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 42px',
                    borderRadius: '30px',
                    border: '1px solid rgba(0,0,0,0.12)',
                    background: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
              <button
                type="button"
                id="creatives-search-btn"
                className="btn btn-primary"
                onClick={handleSearch}
                style={{
                  height: '42px',
                  padding: '0 20px',
                  borderRadius: '30px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                <Search size={15} />
                <span>Search</span>
              </button>
            </div>

            {/* City dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>City:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{ padding: '8px 14px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.12)', background: '#fff', fontSize: '0.85rem', fontWeight: '500', outline: 'none' }}
              >
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Sort by */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: '8px 14px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.12)', background: '#fff', fontSize: '0.85rem', fontWeight: '500', outline: 'none' }}
              >
                <option value="rating">Top Rated (4.8+)</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="experience">Most Experienced</option>
              </select>
            </div>

          </div>
        </div>
      </section>

      {/* Photographers Grid */}
      <section style={{ padding: '50px 0' }}>
        <div className="container">
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>
              Showing {filteredPhotographers.length} verified creators
            </span>
          </div>

          {filteredPhotographers.length === 0 ? (
            <div style={{ background: '#f8fafc', border: '1px solid var(--color-border-subtle)', borderRadius: '20px', padding: '60px 20px', textAlign: 'center', margin: '20px 0' }}>
              <Users size={48} style={{ color: '#00b4d8', opacity: 0.6, margin: '0 auto 16px', display: 'block' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-text-dark)', marginBottom: '8px' }}>
                Verified Creator Network
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 24px', lineHeight: '1.6' }}>
                All shoots are personally coordinated and verified by VibeNoww Directors. Click below to request a tailored shoot or apply as an artist.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => onRequestPhotographer(null)}>
                  Book a Custom Shoot
                </button>
                <button className="btn btn-outline-dark" onClick={() => onNavigate('dashboard')}>
                  Join as Creator
                </button>
              </div>
            </div>
          ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '26px' }}>
            {filteredPhotographers.map((photog) => {
              const isSelected = selectedCreators.some(c => c.id === photog.id);
              return (
                <div
                  key={photog.id}
                  style={{
                    background: '#fff',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: isSelected ? '2px solid var(--color-gold-warm)' : '1px solid var(--color-border-subtle)',
                    boxShadow: isSelected ? '0 10px 30px rgba(229,184,66,0.25)' : 'var(--shadow-sm)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-6px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div>
                    {/* Cover & Rating */}
                    <div style={{ height: '160px', position: 'relative', background: '#1e293b' }}>
                      <img src={photog.coverImage} alt={photog.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(8,11,17,0.75)', backdropFilter: 'blur(6px)', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={12} style={{ color: '#00d2ff', fill: '#00d2ff' }} /> {photog.rating} ({photog.reviewCount})
                      </div>
                    </div>

                    <div style={{ padding: '20px', marginTop: '-45px', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                        <img
                          src={photog.avatar}
                          alt={photog.name}
                          style={{ width: '68px', height: '68px', borderRadius: '18px', border: '3px solid #fff', objectFit: 'cover', boxShadow: 'var(--shadow-md)' }}
                        />
                        <button
                          type="button"
                          onClick={() => toggleSelection(photog)}
                          style={{
                            background: isSelected ? 'linear-gradient(135deg, #00d2ff, #0072ff)' : 'var(--color-ivory-card)',
                            color: isSelected ? '#ffffff' : '#475569',
                            border: 'none',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: isSelected ? '0 4px 14px rgba(0,210,255,0.4)' : 'none'
                          }}
                        >
                          {isSelected ? <Check size={12} /> : '+'} {isSelected ? 'Selected' : 'Select'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-text-dark)' }}>
                          {photog.name}
                        </h3>
                        {photog.verified && (
                          <CheckCircle size={16} style={{ color: 'var(--color-gold-dark)' }} title="Verified Profile" />
                        )}
                      </div>

                      <p style={{ color: 'var(--color-gold-dark)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>
                        {photog.title}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b', fontSize: '0.8rem', marginBottom: '14px' }}>
                        <span>📍 {photog.location}</span>
                        <span>⭐ {photog.experienceYears} Yrs Exp</span>
                      </div>

                      <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {photog.bio}
                      </p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                        {photog.specialties?.slice(0, 3).map((sp, idx) => (
                          <span key={idx} style={{ background: 'var(--color-ivory-warm)', color: '#475569', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px', fontWeight: '500' }}>
                            {sp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Starting Rate</span>
                      <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--color-text-dark)', fontFamily: 'var(--font-serif)' }}>
                        ₹{photog.startingPrice?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-outline-dark btn-sm"
                        onClick={() => onViewProfile(photog)}
                      >
                        Profile
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onRequestPhotographer(photog)}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
          )}

        </div>
      </section>

    </div>
  );
};
