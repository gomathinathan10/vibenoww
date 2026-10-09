import React, { useState } from 'react';
import { Sparkles, Camera, MapPin, Eye, ArrowRight } from 'lucide-react';
import { portfolioItems } from '../data/mockData';

export const PortfolioPage = ({ creators = [], onViewProfile, onRequestPhotographer, onOpenBookNow, setActiveLightboxImg, onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Weddings', 'Pre-Wedding', 'Candid', 'Fashion', 'Drone', 'Commercial', 'Baby & Maternity', 'Traditional'];

  const filteredItems = selectedCategory === 'All'
    ? portfolioItems
    : portfolioItems.filter(item => item.category === selectedCategory);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: 'var(--color-text-dark)', paddingTop: '90px' }}>
      
      {/* Header Banner */}
      <section style={{ background: '#080b11', color: '#fff', padding: '60px 0 70px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url('/images/vibenow-moments-hero-clean.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.35 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #080b11 40%, rgba(8,11,17,0.7) 100%)' }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '720px' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.4rem, 4vw, 3.4rem)', fontWeight: '800', marginTop: '14px', marginBottom: '14px', color: '#fff' }}>
              South India's Living Gallery of Emotion & Light
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.6' }}>
              Explore curated wedding moments, pre-wedding couple stories, 4K aerial shots, and editorial fashion captured by verified VibeNoww talent.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section style={{ padding: '30px 0 20px', borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-ivory)' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: selectedCategory === cat ? 'linear-gradient(135deg, #00d2ff, #0072ff)' : '#fff',
                  color: selectedCategory === cat ? '#ffffff' : '#475569',
                  border: selectedCategory === cat ? '1px solid #00d2ff' : '1px solid var(--color-border-subtle)',
                  padding: '8px 18px',
                  borderRadius: '25px',
                  fontWeight: selectedCategory === cat ? '700' : '500',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  boxShadow: selectedCategory === cat ? '0 4px 14px rgba(0,210,255,0.35)' : 'none'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section style={{ padding: '60px 0 90px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#121826',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  position: 'relative',
                  height: '340px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.35s ease'
                }}
                onClick={() => setActiveLightboxImg({ url: item.image, title: item.title, author: item.photographer })}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
                
                {/* Overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,11,17,0.92) 15%, rgba(8,11,17,0.3) 50%, transparent 80%)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{ background: 'rgba(8,11,17,0.7)', backdropFilter: 'blur(6px)', color: 'var(--color-gold-warm)', padding: '4px 10px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: '700' }}>
                      {item.category}
                    </span>
                  </div>

                  <div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#fff', fontWeight: '700', marginBottom: '4px' }}>
                      {item.title}
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#cbd5e1', fontSize: '0.85rem' }}>
                      <span>📷 {item.photographer}</span>
                      <span>📍 {item.location}</span>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Bottom booking CTA */}
          <div style={{ marginTop: '70px', background: 'var(--color-cream-card)', borderRadius: '24px', padding: '40px', border: '1px solid var(--color-border-subtle)', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-text-dark)', marginBottom: '10px' }}>
              Loved A Particular Photography Style?
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', maxWidth: '550px', margin: '0 auto 24px' }}>
              We will match your wedding or brand shoot with the exact artist behind these frames.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button className="btn btn-gold" onClick={() => onNavigate('select-photographers')}>
                <Sparkles size={16} /> Choose From Verified Photographers
              </button>
              <button className="btn btn-outline-dark" onClick={() => onOpenBookNow('Wedding', 'Photo + Video')}>
                Book Custom Shoot
              </button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
