import React, { useState } from 'react';
import {
  Sparkles, ArrowRight, Star, ShieldCheck, CheckCircle2,
  Camera, Video, Plane, Film, Users, ChevronDown, ChevronUp,
  Calculator, Check, Award, Clock, Heart, Play
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { initialReviews, faqList } from '../data/mockData';

export const HomePage = ({
  selectedCreators,
  setSelectedCreators,
  onViewProfile,
  onBookNow,
  onNavigate,
  onOpenEstimate,
  onOpenMultiBooking,
  setActiveLightboxImg
}) => {
  const { publicApprovedPhotographers } = useData();
  const [openFaq, setOpenFaq] = useState(0);

  // Quick inline calculator on home page
  const [calcEvent, setCalcEvent] = useState('Wedding');
  const [calcDays, setCalcDays] = useState(1);
  const [calcDrone, setCalcDrone] = useState(true);
  const [calcCinema, setCalcCinema] = useState(true);

  const calcTotal = (calcEvent === 'Wedding' ? 25000 : 15000) * calcDays +
    (calcCinema ? 15000 * calcDays : 0) +
    (calcDrone ? 8000 * calcDays : 0);

  const toggleCreatorSelection = (creator) => {
    if (selectedCreators.some(c => c.id === creator.id)) {
      setSelectedCreators(selectedCreators.filter(c => c.id !== creator.id));
    } else {
      setSelectedCreators([...selectedCreators, creator]);
    }
  };

  const categories = [
    { title: 'Weddings', img: '/images/vibenow-moments-card.jpg', tag: 'Weddings', count: '180+ Shoots' },
    { title: 'Cinematography', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', tag: 'Cinematography', count: '4K Cinema' },
    { title: 'Drone Shoots', img: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80', tag: 'Drone', count: 'Aerial 4K' },
    { title: 'Model & Brand', img: '/images/vibenow-business-card.jpg', tag: 'Commercial', count: 'E-Commerce' }
  ];

  return (
    <div style={{ background: '#fff', color: 'var(--color-text-dark)' }}>

      {/* 1. Cinematic Hero Section */}
      <section className="hero-cinematic" style={{ backgroundImage: `url('/images/vibenow-hero-bg.jpg')` }}>
        <div className="hero-cinematic-overlay" />
        <div className="container hero-cinematic-container">
          
          {/* Top Hero Heading & Taglines */}
          <div className="hero-top-block">
            <h1 className="hero-moment-top-bold">
              WHERE YOUR VIBE<br />FINDS ITS PEOPLE.
            </h1>
            <div className="hero-taglines-small">
              <span>Authentic emotions, unforgettable frames.</span>
              <span>South India's most verified visual storytelling collective.</span>
              <span style={{ color: '#00d2ff' }}>From Tirunelveli & Chennai to Everywhere You Celebrate.</span>
            </div>
          </div>

          <div className="hero-middle-spacer" />

          {/* Hero Bottom Bar with CTAs & Editorial Badge */}
          <div className="hero-bottom-block">
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px' }}>
              
              <div className="hero-cta-group">
                <button
                  className="btn btn-gold hero-btn-compact"
                  onClick={() => onNavigate('select-photographers')}
                >
                  <Sparkles size={16} /> Explore Photographers
                </button>
                <button
                  className="btn btn-outline-light hero-btn-compact"
                  onClick={onOpenEstimate}
                >
                  <Calculator size={16} /> Instant Quotation
                </button>
                <button
                  className="btn btn-outline-light hero-btn-compact"
                  onClick={() => onBookNow(null)}
                >
                  Book Consultation
                </button>
              </div>

              <div className="hero-editorial-badge hide-on-mobile">
                <div className="hero-editorial-script">
                  <span>Crafted with</span>
                  <span className="brand-gold-text">Passion & Light</span>
                </div>
                <svg className="hero-script-swoosh" viewBox="0 0 130 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 18C40 4 90 2 128 14" stroke="#00d2ff" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 2. "More Than a Booking Platform" Editorial Section */}
      <section className="section-more-than-booking">
        <div className="container">
          <div className="more-than-booking-grid">
            
            {/* Left Content */}
            <div>
              <div className="editorial-eyebrow">THE VIBENOWW STANDARD</div>
              <h2 className="editorial-heading">
                More Than A Booking Platform. A Creative Ecosystem.
              </h2>
              <div className="editorial-content">
                <p>
                  Finding the right photographer shouldn't be about endless Instagram DMs or uncertain price quotes. VibeNoww curates South India's finest visual creators with verified portfolios, equipment standards, and escrow protection.
                </p>
                <p className="editorial-gold-highlight">
                  ✦ Guaranteed delivery timelines & transparent fixed packages.
                </p>
                <p>
                  Whether it is a royal heritage wedding in Tirunelveli, an aerial documentary in Madurai, or high-fashion lookbook in Chennai, we pair you with vetted artists who match your exact vision.
                </p>
              </div>
            </div>

            {/* Right Category Gallery */}
            <div className="category-gallery-grid">
              {categories.map((cat, i) => (
                <div
                  key={i}
                  className="category-gallery-card"
                  onClick={() => onNavigate('portfolio')}
                >
                  <img src={cat.img} alt={cat.title} className="category-card-img" />
                  <div className="card-overlay" />
                  <div className="card-title">
                    <div>{cat.title}</div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-gold-warm)', fontWeight: '500' }}>{cat.count}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 3. Dual Showcase: For Moments vs For Business */}
      <section style={{ padding: '80px 0', background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 50px' }}>
            <div className="editorial-eyebrow">TAILORED CREATIVE SERVICES</div>
            <h2 className="editorial-heading" style={{ fontSize: '2.5rem' }}>
              Crafted For Personal Memories & Commercial Excellence
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            
            {/* For Moments Card */}
            <div
              style={{
                borderRadius: '24px',
                overflow: 'hidden',
                background: '#0d121d',
                color: '#fff',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '440px'
              }}
            >
              <div style={{ position: 'absolute', inset: 0, backgroundImage: `url('/images/vibenow-moments-card.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.4 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0d121d 20%, rgba(13,18,29,0.4) 60%, rgba(13,18,29,0.8))' }} />
              
              <div style={{ position: 'relative', zIndex: 2, padding: '36px' }}>
                <span style={{ background: 'var(--color-gold-bg)', color: 'var(--color-gold-warm)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                  Moments
                </span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#fff', marginTop: '12px', marginBottom: '10px' }}>
                  Weddings & Celebrations
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  Candid wedding photography, cinematic 4K film trailers, drone aerial coverage, maternity, baby milestones, and heirloom family albums.
                </p>
              </div>

              <div style={{ position: 'relative', zIndex: 2, padding: '0 36px 36px' }}>
                <button
                  className="btn btn-gold"
                  onClick={() => onNavigate('portfolio')}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Explore Moments Portfolio <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* For Business Card */}
            <div
              style={{
                borderRadius: '24px',
                overflow: 'hidden',
                background: '#0d121d',
                color: '#fff',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '440px'
              }}
            >
              <div style={{ position: 'absolute', inset: 0, backgroundImage: `url('/images/vibenow-business-card.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.4 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0d121d 20%, rgba(13,18,29,0.4) 60%, rgba(13,18,29,0.8))' }} />
              
              <div style={{ position: 'relative', zIndex: 2, padding: '36px' }}>
                <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                  Business
                </span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#fff', marginTop: '12px', marginBottom: '10px' }}>
                  Brands & E-Commerce
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  Silk saree lookbooks, gold jewelry reflections, e-commerce cataloging, dynamic social media video reels, and brand commercial campaigns.
                </p>
              </div>

              <div style={{ position: 'relative', zIndex: 2, padding: '0 36px 36px' }}>
                <button
                  className="btn btn-outline-light"
                  onClick={() => onNavigate('services')}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  View Commercial Services <ArrowRight size={16} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Featured Verified Photographers */}
      <section style={{ padding: '90px 0', background: 'var(--color-ivory)' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', marginBottom: '45px' }}>
            <div>
              <div className="editorial-eyebrow">VERIFIED ARTISTS</div>
              <h2 className="editorial-heading" style={{ margin: 0 }}>
                Featured Creators In South India
              </h2>
            </div>
            <button
              className="btn btn-outline-dark"
              onClick={() => onNavigate('select-photographers')}
            >
              View All Photographers <ArrowRight size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {publicApprovedPhotographers.slice(0, 4).map((photog) => {
              const isSelected = selectedCreators.some(c => c.id === photog.id);
              return (
                <div
                  key={photog.id}
                  style={{
                    background: '#fff',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: isSelected ? '2px solid var(--color-gold-warm)' : '1px solid var(--color-border-subtle)',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'var(--transition-smooth)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-6px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div>
                    {/* Card Cover & Avatar */}
                    <div style={{ height: '150px', position: 'relative', background: '#1e293b' }}>
                      <img src={photog.coverImage} alt={photog.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(8,11,17,0.7)', backdropFilter: 'blur(6px)', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={12} style={{ color: '#e5b842', fill: '#e5b842' }} /> {photog.rating}
                      </div>
                    </div>

                    <div style={{ padding: '20px', marginTop: '-45px', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                        <img
                          src={photog.avatar}
                          alt={photog.name}
                          style={{ width: '64px', height: '64px', borderRadius: '16px', border: '3px solid #fff', objectFit: 'cover', boxShadow: 'var(--shadow-md)' }}
                        />
                        <button
                          type="button"
                          onClick={() => toggleCreatorSelection(photog)}
                          style={{
                            background: isSelected ? 'var(--color-gold-warm)' : 'var(--color-ivory-card)',
                            color: isSelected ? '#080b11' : '#475569',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {isSelected ? <Check size={12} /> : '+'} {isSelected ? 'Selected' : 'Select'}
                        </button>
                      </div>

                      <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15rem', fontWeight: '800', color: 'var(--color-text-dark)', marginBottom: '4px' }}>
                        {photog.name}
                      </h4>
                      <p style={{ color: 'var(--color-gold-dark)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>
                        {photog.title}
                      </p>
                      <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '14px' }}>
                        📍 {photog.location}
                      </p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                        {photog.specialties?.slice(0, 3).map((sp, idx) => (
                          <span key={idx} style={{ background: 'var(--color-ivory-warm)', color: '#475569', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', fontWeight: '500' }}>
                            {sp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Starting</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-text-dark)' }}>
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
                        onClick={() => onBookNow(photog)}
                      >
                        Book
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. Smart Quotation Calculator Widget on Homepage */}
      <section style={{ padding: '80px 0', background: '#050814', color: '#fff' }}>
        <div className="container">
          <div style={{ background: '#0e152d', border: '1px solid rgba(0, 210, 255, 0.4)', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(0,210,255,0.15)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
              
              <div>
                <span style={{ background: 'rgba(0, 210, 255, 0.12)', border: '1px solid rgba(0, 210, 255, 0.3)', color: '#00d2ff', padding: '4px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                  Live Price Estimator
                </span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: '#fff', marginTop: '12px', marginBottom: '14px' }}>
                  Calculate Your Shoot Budget In 10 Seconds
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
                  Pick your event duration and equipment add-ons to see estimated charges backed by verified VibeNoww creator standards.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                    <CheckCircle2 size={16} style={{ color: '#00d2ff' }} /> No hidden agency fees or surprise travel costs
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                    <CheckCircle2 size={16} style={{ color: '#00d2ff' }} /> Verified deliverables with raw photo gallery guarantee
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                    <CheckCircle2 size={16} style={{ color: '#00d2ff' }} /> Escrow payment security until final output delivery
                  </div>
                </div>
              </div>

              {/* Interactive Widget Box */}
              <div style={{ background: '#141c3b', border: '1px solid rgba(0, 210, 255, 0.25)', borderRadius: '18px', padding: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Occasion</label>
                  <select
                    value={calcEvent}
                    onChange={(e) => setCalcEvent(e.target.value)}
                    style={{ width: '100%', background: '#090d19', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px', borderRadius: '8px' }}
                  >
                    <option value="Wedding">Wedding (Traditional + Candid)</option>
                    <option value="Pre-Wedding">Pre-Wedding / Outdoor Shoot</option>
                    <option value="Commercial">Brand / Product Commercial</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Shoot Duration</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setCalcDays(d)}
                        style={{
                          flex: 1,
                          background: calcDays === d ? 'linear-gradient(135deg, #00d2ff, #0072ff)' : '#090d19',
                          color: '#fff',
                          border: calcDays === d ? '1px solid #00d2ff' : '1px solid rgba(255,255,255,0.1)',
                          padding: '8px',
                          borderRadius: '8px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {d} {d === 1 ? 'Day' : 'Days'}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', fontSize: '0.85rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={calcCinema} onChange={e => setCalcCinema(e.target.checked)} />
                    <span>4K Cinema Teaser</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={calcDrone} onChange={e => setCalcDrone(e.target.checked)} />
                    <span>4K Drone Pilot</span>
                  </label>
                </div>

                <div style={{ background: '#090d19', border: '1px solid rgba(0, 210, 255, 0.25)', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Live Estimate</span>
                    <div style={{ fontSize: '1.7rem', fontWeight: '800', color: '#00d2ff', fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em' }}>
                      ₹{calcTotal.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={onOpenEstimate}
                  >
                    Get Detailed PDF Quote
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 6. How It Works 4-Step Process */}
      <section style={{ padding: '90px 0', background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 50px' }}>
            <div className="editorial-eyebrow">SIMPLE 4-STEP BOOKING</div>
            <h2 className="editorial-heading" style={{ fontSize: '2.5rem' }}>
              How VibeNoww Delivers Magic
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '30px' }}>
            {[
              { step: '01', title: 'Select Verified Talent', desc: 'Filter by city, style, and real customer reviews across South India.' },
              { step: '02', title: 'Instant Transparent Quote', desc: 'Customise days, drone, teaser reels, and albums with zero hidden fees.' },
              { step: '03', title: 'Escrow Booking Protection', desc: 'Your deposit is held safely. Creator is committed with SLA guarantee.' },
              { step: '04', title: '4K Delivery & Joy', desc: 'Sneak peeks in 7 days, complete high-resolution gallery in weeks.' }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--color-cream-card)',
                  padding: '30px',
                  borderRadius: '20px',
                  border: '1px solid var(--color-border-subtle)',
                  position: 'relative'
                }}
              >
                <div style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--color-gold-warm)', fontFamily: 'var(--font-serif)', opacity: 0.8, marginBottom: '10px' }}>
                  {item.step}
                </div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-text-dark)', marginBottom: '8px' }}>
                  {item.title}
                </h4>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Client Reviews & Stories */}
      <section style={{ padding: '80px 0', background: 'var(--color-ivory)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 50px' }}>
            <div className="editorial-eyebrow">HAPPY COUPLES & BRANDS</div>
            <h2 className="editorial-heading" style={{ fontSize: '2.5rem' }}>
              Stories Captured With Soul
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {initialReviews.map((rev) => (
              <div
                key={rev.id}
                style={{
                  background: '#fff',
                  borderRadius: '20px',
                  padding: '30px',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '4px', color: '#e5b842', marginBottom: '16px' }}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="#e5b842" />
                    ))}
                  </div>
                  <p style={{ color: '#334155', fontStyle: 'italic', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '20px' }}>
                    "{rev.comment}"
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={rev.avatar} alt={rev.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--color-text-dark)' }}>{rev.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{rev.event} • {rev.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ Section */}
      <section style={{ padding: '80px 0', background: '#fff' }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="editorial-eyebrow">COMMON QUESTIONS</div>
            <h2 className="editorial-heading" style={{ fontSize: '2.2rem' }}>
              Everything You Need To Know
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqList.map((faq, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--color-cream-card)',
                  borderRadius: '14px',
                  border: '1px solid var(--color-border-subtle)',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '18px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: '700',
                    fontSize: '1rem',
                    color: 'var(--color-text-dark)'
                  }}
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp size={18} style={{ color: 'var(--color-gold-dark)' }} /> : <ChevronDown size={18} />}
                </button>
                {openFaq === idx && (
                  <div style={{ padding: '0 24px 20px', color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: '1.65' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Final CTA Banner */}
      <section style={{ padding: '90px 0', background: '#080b11', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url('/images/vibenow-final-cta.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #080b11 40%, rgba(8,11,17,0.7) 100%)' }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '650px' }}>
            <div className="editorial-eyebrow" style={{ color: '#00d2ff' }}>READY TO MAKE MAGIC?</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', color: '#fff', fontWeight: '800', lineHeight: '1.2', marginBottom: '18px' }}>
              Your Unforgettable Moments Deserve Extraordinary Artists.
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.65', marginBottom: '30px' }}>
              Get in touch with our creative talent directors today. We'll match your event with verified cinematographers and photographers anywhere in South India.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <button
                className="btn btn-gold"
                onClick={() => onNavigate('select-photographers')}
                style={{ padding: '14px 32px', fontSize: '0.95rem' }}
              >
                <Sparkles size={16} /> Choose Your Photographers
              </button>
              <button
                className="btn btn-outline-light"
                onClick={() => onNavigate('contact')}
                style={{ padding: '14px 30px', fontSize: '0.95rem' }}
              >
                Contact Creative Lead
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
