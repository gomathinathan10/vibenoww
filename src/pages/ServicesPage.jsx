import React, { useState } from 'react';
import { Sparkles, CheckCircle, ArrowRight, ShieldCheck, Camera, Video, Plane, Film, Layers } from 'lucide-react';
import { servicePackages } from '../data/mockData';

export const ServicesPage = ({ onNavigate, onOpenBookNow, onOpenEstimate }) => {
  const [selectedService, setSelectedService] = useState(servicePackages[0]);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: 'var(--color-text-dark)', paddingTop: '90px' }}>
      
      {/* Header Banner */}
      <section style={{ background: '#080b11', color: '#fff', padding: '60px 0 70px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url('/images/vibenow-business-hero-clean.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.35 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #080b11 40%, rgba(8,11,17,0.7) 100%)' }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '720px' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.4rem, 4vw, 3.4rem)', fontWeight: '800', marginTop: '14px', marginBottom: '14px', color: '#fff' }}>
              Creative Talent & Production For Every Scale
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.6' }}>
              From multi-day traditional weddings and candid cinematography to commercial brand campaigns, drone surveys, and post-production editing.
            </p>
          </div>
        </div>
      </section>

      {/* Services List with Detailed Tiers */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
            {servicePackages.map((pkg, index) => (
              <div
                key={pkg.id}
                style={{
                  background: 'var(--color-cream-card)',
                  borderRadius: '24px',
                  border: '1px solid var(--color-border-subtle)',
                  padding: '40px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '40px',
                  alignItems: 'center'
                }}
              >
                {/* Left details */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ background: 'linear-gradient(135deg, #00d2ff, #0072ff)', color: '#fff', padding: '4px 12px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: '800', boxShadow: '0 2px 10px rgba(0,210,255,0.3)' }}>
                      {pkg.badge}
                    </span>
                    <span style={{ color: '#0072ff', fontWeight: '700', fontSize: '0.9rem' }}>
                      Starting from ₹{pkg.startingPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-text-dark)', marginBottom: '8px' }}>
                    {pkg.title}
                  </h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
                    {pkg.subtitle}
                  </p>

                  <div style={{ marginBottom: '28px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-dark)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>
                      Key Inclusions
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {pkg.features.map((feat, fidx) => (
                        <li key={fidx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#475569' }}>
                          <CheckCircle size={16} style={{ color: 'var(--color-gold-dark)', flexShrink: 0 }} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-gold"
                      onClick={() => onNavigate('select-photographers')}
                    >
                      <Sparkles size={16} /> Hire Talent For This
                    </button>
                    <button
                      className="btn btn-outline-dark"
                      onClick={() => onOpenBookNow(pkg.title, 'Photo + Video')}
                    >
                      Book Consultation
                    </button>
                  </div>
                </div>

                {/* Right Tiers Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {pkg.tiers.map((tier, tidx) => (
                    <div
                      key={tidx}
                      style={{
                        background: '#fff',
                        borderRadius: '16px',
                        padding: '20px 24px',
                        border: '1px solid var(--color-border-subtle)',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--color-text-dark)' }}>
                          {tier.name}
                        </span>
                        <span style={{ fontWeight: '800', fontSize: '1.25rem', color: 'var(--color-gold-dark)', fontFamily: 'var(--font-serif)' }}>
                          {tier.price}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>{tier.days}</span>
                      <p style={{ color: '#475569', fontSize: '0.85rem', margin: 0 }}>{tier.desc}</p>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Custom Proposal Banner */}
      <section style={{ background: '#0d121d', color: '#fff', padding: '70px 0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '700px' }}>
          <span style={{ background: 'var(--color-gold-bg)', color: 'var(--color-gold-warm)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
            Enterprise & Multi-Location
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: '#fff', marginTop: '14px', marginBottom: '14px' }}>
            Need A Custom Production Crew?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6', marginBottom: '30px' }}>
            We organize multi-camera live streaming, crane setups, drone teams, and overnight colorist turnarounds for massive destination events across South India.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button className="btn btn-gold" onClick={onOpenEstimate}>
              Calculate Custom Estimate
            </button>
            <button className="btn btn-outline-light" onClick={() => onNavigate('contact')}>
              Speak With Production Lead
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
