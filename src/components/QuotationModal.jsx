import React, { useState } from 'react';
import { X, Calculator, Check, Sparkles, Send, Download, Phone, MapPin, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useData } from '../context/DataContext';

export const QuotationModal = ({ isOpen, onClose, onNavigate }) => {
  const { createWork } = useData();
  const [eventType, setEventType] = useState('Wedding');
  const [coverageDays, setCoverageDays] = useState(1);
  const [includeCandid, setIncludeCandid] = useState(true);
  const [includeCinematic, setIncludeCinematic] = useState(true);
  const [includeDrone, setIncludeDrone] = useState(false);
  const [albumCopies, setAlbumCopies] = useState(1);
  const [city, setCity] = useState('Tirunelveli');
  
  // Client details
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [eventDate, setEventDate] = useState('2026-11-20');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  // Calculation formula
  let baseRate = 0;
  if (eventType === 'Wedding') baseRate = 20000;
  else if (eventType === 'Pre-Wedding') baseRate = 12000;
  else if (eventType === 'Birthday & Baby') baseRate = 10000;
  else if (eventType === 'Commercial') baseRate = 15000;
  else baseRate = 10000;

  const candidCost = includeCandid ? 12000 * coverageDays : 0;
  const cinemaCost = includeCinematic ? 16000 * coverageDays : 0;
  const droneCost = includeDrone ? 8000 * coverageDays : 0;
  const albumCost = albumCopies * 6000;
  const subtotal = (baseRate * coverageDays) + candidCost + cinemaCost + droneCost + albumCost;
  const discount = subtotal > 50000 ? 5000 : 0;
  const finalEstimate = subtotal - discount;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      alert('Please provide your name and contact phone number.');
      return;
    }

    const services = [];
    if (includeCandid) services.push('Candid Photography');
    if (includeCinematic) services.push('Cinematic Video');
    if (includeDrone) services.push('4K Drone Aerial');
    if (albumCopies > 0) services.push(`${albumCopies} Album${albumCopies > 1 ? 's' : ''}`);

    createWork({
      clientName,
      clientPhone,
      eventType: `${eventType} (${coverageDays} Day${coverageDays > 1 ? 's' : ''})`,
      eventDate,
      location: `${city}, Tamil Nadu`,
      requiredServices: services,
      estimatedBudget: finalEstimate,
      quotation: {
        photographyCharge: (baseRate * coverageDays) + candidCost,
        additionalHours: 0,
        travelCharge: 0,
        equipmentCharge: droneCost,
        editingCharge: cinemaCost,
        discount: discount,
        finalAmount: finalEstimate,
        quotationNotes: `Instant Web Estimate for ${coverageDays} day(s) ${eventType}. Includes ${services.join(', ')}.`
      }
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {}

    setSubmitted(true);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(8, 11, 17, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="animate-fade-in" style={{ background: '#0e152d', border: '1px solid rgba(0, 210, 255, 0.4)', borderRadius: '20px', maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto', color: '#fff', padding: '30px', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(0,210,255,0.2)' }}>
        
        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={18} />
        </button>

        {!submitted ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <img
                src="/images/vibenoww-logo.png"
                alt="VibeNoww Logo"
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  objectFit: 'contain',
                  border: '1.5px solid rgba(0,210,255,0.5)',
                  boxShadow: '0 0 16px rgba(0,210,255,0.35), 0 0 25px rgba(217,70,239,0.2)'
                }}
              />
              <div>
                <div style={{ background: 'rgba(0, 210, 255, 0.12)', border: '1px solid rgba(0, 210, 255, 0.3)', color: '#00d2ff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Calculator size={13} />
                  Instant Quotation Builder
                </div>
                <div className="logo-brand" style={{ fontSize: '1.2rem', marginLeft: '6px', verticalAlign: 'middle' }}>
                  <span className="logo-vibe" style={{ color: '#fff' }}>VIBE</span>
                  <span className="logo-now">NOWW</span>
                </div>
              </div>
            </div>
            
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#fff', marginBottom: '10px' }}>
              Estimate Your Dream Event Shoot
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>
              Transparent pricing with no hidden charges. Customize event requirements to view real-time estimates.
            </p>

            <form onSubmit={handleSubmit}>
              {/* Event Type & Location */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Event Category</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }}
                  >
                    <option value="Wedding">Traditional & Candid Wedding</option>
                    <option value="Pre-Wedding">Pre-Wedding / Couple Shoot</option>
                    <option value="Birthday & Baby">Maternity & Birthday Shoot</option>
                    <option value="Commercial">Brand Commercial / Fashion</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Location / City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }}
                  >
                    <option value="Tirunelveli">Tirunelveli</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Madurai">Madurai</option>
                    <option value="Coimbatore">Coimbatore</option>
                    <option value="Tenkasi">Tenkasi / Courtallam</option>
                    <option value="Kanyakumari">Kanyakumari</option>
                  </select>
                </div>
              </div>

              {/* Coverage Days & Options */}
              <div style={{ background: '#182032', padding: '18px', borderRadius: '14px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#f5f2ec' }}>Coverage Days:</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setCoverageDays(days)}
                        style={{
                          background: coverageDays === days ? 'var(--color-gold-warm)' : 'rgba(255,255,255,0.08)',
                          color: coverageDays === days ? '#080b11' : '#fff',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {days} {days === 1 ? 'Day' : 'Days'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={includeCandid} onChange={(e) => setIncludeCandid(e.target.checked)} />
                    <span>Candid Photography (+₹12k/d)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={includeCinematic} onChange={(e) => setIncludeCinematic(e.target.checked)} />
                    <span>4K Cinema Teaser (+₹16k/d)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={includeDrone} onChange={(e) => setIncludeDrone(e.target.checked)} />
                    <span>Drone Aerial (+₹8k/d)</span>
                  </label>
                </div>
              </div>

              {/* Price Breakdown Banner */}
              <div style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.12), rgba(217,70,239,0.08))', border: '1px solid rgba(0,210,255,0.35)', borderRadius: '14px', padding: '16px 20px', marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,210,255,0.1)' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Estimated Budget</span>
                  <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#00d2ff', fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em' }}>
                    ₹{finalEstimate.toLocaleString('en-IN')}
                  </div>
                </div>
                {discount > 0 && (
                  <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
                    Save ₹{discount.toLocaleString('en-IN')} Bundle Offer
                  </div>
                )}
              </div>

              {/* Client Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>WhatsApp / Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98412 88990"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Approx Event Date</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onClose} className="btn btn-outline-light">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px' }}>
                  <Sparkles size={16} /> Send Me Official Quotation
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(34,197,94,0.15)', color: '#4ade80', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Check size={32} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#fff', marginBottom: '12px' }}>
              Quotation Generated Successfully!
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '440px', margin: '0 auto 24px', lineHeight: '1.6' }}>
              Thank you, <strong style={{ color: '#fff' }}>{clientName}</strong>. Our booking director will contact you via WhatsApp at <strong style={{ color: 'var(--color-gold-warm)' }}>{clientPhone}</strong> with available verified photographer portfolios matching your ₹{finalEstimate.toLocaleString('en-IN')} estimate.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
              <button
                className="btn btn-gold"
                onClick={() => {
                  onClose();
                  onNavigate('select-photographers');
                }}
              >
                Browse Available Photographers
              </button>
              <button className="btn btn-outline-light" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
