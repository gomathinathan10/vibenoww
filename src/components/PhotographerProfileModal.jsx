import React, { useState } from 'react';
import { X, Star, MapPin, Award, CheckCircle, Calendar, Sparkles, Image, ShieldCheck, Heart } from 'lucide-react';

export const PhotographerProfileModal = ({ photographer, isOpen, onClose, onBookNow, onOpenLightbox }) => {
  const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio', 'packages', 'about'

  if (!isOpen || !photographer) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(8, 11, 17, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="animate-fade-in" style={{ background: '#0e152d', border: '1px solid rgba(0, 210, 255, 0.4)', borderRadius: '24px', maxWidth: '850px', width: '100%', maxHeight: '92vh', overflowY: 'auto', color: '#fff', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(0,210,255,0.2)' }}>
        
        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={18} />
        </button>

        {/* Cover Header */}
        <div style={{ height: '220px', position: 'relative', background: '#0a0e17' }}>
          <img
            src={photographer.coverImage}
            alt={photographer.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0e152d 5%, transparent 60%)' }} />
        </div>

        {/* Profile Info Row */}
        <div style={{ padding: '0 30px 20px', marginTop: '-60px', position: 'relative' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
              <img
                src={photographer.avatar}
                alt={photographer.name}
                style={{ width: '100px', height: '100px', borderRadius: '20px', border: '4px solid #0e152d', objectFit: 'cover', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#fff', fontWeight: '800' }}>
                    {photographer.name}
                  </h2>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,210,255,0.12)', border: '1px solid rgba(0,210,255,0.3)', borderRadius: '20px', padding: '3px 10px', fontSize: '0.72rem', color: '#00d2ff', fontWeight: 700 }}>
                    <img src="/images/vibenoww-logo.png" alt="VibeNoww" style={{ width: '15px', height: '15px', objectFit: 'contain' }} />
                    Verified VibeNoww Partner
                  </div>
                </div>
                <p style={{ color: '#00d2ff', fontSize: '0.95rem', fontWeight: '600' }}>
                  {photographer.title}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} style={{ color: '#00d2ff' }} /> {photographer.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={14} style={{ color: '#00d2ff', fill: '#00d2ff' }} /> {photographer.rating} ({photographer.reviewCount} reviews)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={14} style={{ color: '#00d2ff' }} /> {photographer.experienceYears} Years Exp
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Book CTA */}
            <button
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onBookNow(photographer);
              }}
              style={{ padding: '12px 28px', fontSize: '0.95rem' }}
            >
              <Sparkles size={16} /> Book {photographer.name.split(' ')[0]} Now
            </button>
          </div>

          {/* Specialties pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            {photographer.specialties?.map((spec, i) => (
              <span key={i} style={{ background: '#182032', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500' }}>
                {spec}
              </span>
            ))}
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', gap: '24px', marginBottom: '24px' }}>
            {[
              { id: 'portfolio', label: `Portfolio Gallery (${photographer.portfolio?.length || 0})` },
              { id: 'packages', label: `Pricing Packages (${photographer.packages?.length || 0})` },
              { id: 'about', label: 'Biography & Gear' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid var(--color-gold-warm)' : '2px solid transparent',
                  color: activeTab === tab.id ? '#fff' : '#94a3b8',
                  padding: '10px 4px',
                  fontWeight: activeTab === tab.id ? '700' : '500',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'portfolio' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
              {photographer.portfolio?.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onOpenLightbox(item.url || item.thumb, item.title, photographer.name)}
                  style={{ borderRadius: '12px', overflow: 'hidden', height: '180px', position: 'relative', cursor: 'pointer', background: '#182032' }}
                >
                  <img
                    src={item.url || item.thumb}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,11,17,0.9), transparent 60%)', display: 'flex', alignItems: 'flex-end', padding: '12px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>{item.title}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'packages' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {photographer.packages?.map((pkg, idx) => (
                <div key={idx} style={{ background: '#141c3b', border: '1px solid rgba(0, 210, 255, 0.3)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>{pkg.name}</h4>
                      <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#00d2ff' }}>₹{pkg.price?.toLocaleString('en-IN')}</span>
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                      {pkg.features?.map((feat, fidx) => (
                        <li key={fidx} style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle size={14} style={{ color: '#00d2ff', flexShrink: 0 }} /> {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    className="btn btn-outline-light btn-sm"
                    onClick={() => {
                      onClose();
                      onBookNow(photographer);
                    }}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Select This Package
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'about' && (
            <div style={{ background: '#182032', borderRadius: '16px', padding: '24px', lineHeight: '1.7', color: '#cbd5e1', fontSize: '0.95rem' }}>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '10px', fontWeight: '700' }}>Artist Background</h4>
              <p style={{ marginBottom: '20px' }}>{photographer.bio}</p>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ color: 'var(--color-gold-warm)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Camera Gear & Tools</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Sony A7 IV, FX3 Cinema, 24-70mm GM II, 85mm f/1.4, DJI Mavic 3 Pro Cine</div>
                </div>
                <div>
                  <div style={{ color: 'var(--color-gold-warm)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Base Location</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{photographer.location} (Available across South India)</div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
