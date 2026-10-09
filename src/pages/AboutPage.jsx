import React from 'react';
import { Sparkles, ShieldCheck, CheckCircle2, Award, Heart, Camera, ArrowRight, Users, Star } from 'lucide-react';

export const AboutPage = ({ onNavigate }) => {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: 'var(--color-text-dark)', paddingTop: '90px' }}>
      
      {/* Hero Banner */}
      <section style={{ background: '#080b11', color: '#fff', padding: '60px 0 70px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url('/images/vibenow-creators-hero.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #080b11 40%, rgba(8,11,17,0.7) 100%)' }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '720px' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.4rem, 4vw, 3.4rem)', fontWeight: '800', marginTop: '14px', marginBottom: '14px', color: '#fff' }}>
              Where Soulful Stories Meet Verified Artistry
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.6' }}>
              Born out of the cultural heartland of Tirunelveli and expanding across South India, VibeNoww is bridging the trust gap between passionate visual artists and clients seeking timeless memories.
            </p>
          </div>
        </div>
      </section>

      {/* Story & Vision */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px', alignItems: 'center' }}>
            <div>
              <div className="editorial-eyebrow">WHY VIBENOWW WAS BORN</div>
              <h2 className="editorial-heading">
                Transforming How Weddings & Brands Experience Visual Art
              </h2>
              <div className="editorial-content">
                <p>
                  In traditional photography booking, clients often face ambiguous pricing, unverified gear quality, delayed albums, or creators not showing up on time. On the creator side, talented freelancers struggle with inconsistent gig pipelines and payment delays.
                </p>
                <p className="editorial-gold-highlight">
                  VibeNoww solves this with a unified creative network, standardized contracts, and strict quality verification.
                </p>
                <p>
                  We treat photography not as a commodity, but as an heirloom craft. We empower local creative talents across Tirunelveli, Madurai, Chennai, Coimbatore, and Kanyakumari to showcase their true worth.
                </p>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <img
                src="/images/vibenow-why-creators.jpg"
                alt="VibeNoww Creator Community"
                style={{ width: '100%', borderRadius: '24px', boxShadow: 'var(--shadow-lg)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5-Pillar Verification Standard */}
      <section style={{ background: 'var(--color-ivory)', padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 50px' }}>
            <div className="editorial-eyebrow">THE 5-PILLAR AUDIT</div>
            <h2 className="editorial-heading" style={{ fontSize: '2.4rem' }}>
              How Every Artist Is Verified
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {[
              { title: '1. Portfolio Authenticity', desc: 'Original RAW file verification to ensure the artist is the actual creator behind every shot.' },
              { title: '2. Professional Camera Gear', desc: 'Minimum dual-slot full-frame camera kits, high-speed prime lenses & backup lighting equipment.' },
              { title: '3. Escrow Payment Guarantee', desc: 'Client funds are protected safely and released only upon verified milestone delivery.' },
              { title: '4. Punctuality SLA', desc: 'Strict time compliance on wedding muhurthams and corporate shoot schedules.' },
              { title: '5. Fast Color-Graded Output', desc: '7-day sneak peek delivery guarantee and cloud gallery access.' }
            ].map((pillar, i) => (
              <div
                key={i}
                style={{
                  background: '#fff',
                  padding: '28px',
                  borderRadius: '18px',
                  border: '1px solid var(--color-border-subtle)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ color: 'var(--color-gold-dark)', marginBottom: '14px' }}>
                  <ShieldCheck size={28} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-text-dark)', marginBottom: '8px' }}>
                  {pillar.title}
                </h4>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', lineHeight: '1.6' }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Milestones */}
      <section style={{ padding: '70px 0', background: '#0d121d', color: '#fff' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--color-gold-warm)', fontFamily: 'var(--font-serif)' }}>500+</div>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>Weddings & Events Captured</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--color-gold-warm)', fontFamily: 'var(--font-serif)' }}>50+</div>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>Verified Creative Artists</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--color-gold-warm)', fontFamily: 'var(--font-serif)' }}>99.4%</div>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>Client Satisfaction Rate</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--color-gold-warm)', fontFamily: 'var(--font-serif)' }}>₹1.2Cr+</div>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>Creator Payouts Facilitated</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
