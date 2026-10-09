import React, { useState } from 'react';
import { X, Check, Users, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useData } from '../context/DataContext';

export const MultiBookingModal = ({ isOpen, onClose, selectedCreators = [], onClearSelection, onNavigate }) => {
  const { createOrder } = useData();
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [eventDate, setEventDate] = useState('2026-11-20');
  const [eventType, setEventType] = useState('Wedding');
  const [city, setCity] = useState('Tirunelveli');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || selectedCreators.length === 0) return null;

  const totalEst = selectedCreators.reduce((sum, c) => sum + (c.startingPrice || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      alert('Please provide your name and phone number.');
      return;
    }

    createOrder({
      clientName,
      clientPhone,
      eventType: `Multi-Talent Booking (${selectedCreators.length} Talents)`,
      eventDate,
      location: `${city}, Tamil Nadu`,
      requiredServices: selectedCreators.map(c => `${c.name} (${c.title})`),
      estimatedBudget: totalEst,
      quotation: {
        photographyCharge: totalEst,
        additionalHours: 0,
        travelCharge: 0,
        equipmentCharge: 0,
        editingCharge: 0,
        discount: 0,
        finalAmount: totalEst,
        quotationNotes: `Multi-Creator booking for: ${selectedCreators.map(c => c.name).join(', ')}.`
      }
    });

    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    } catch (err) {}

    setSubmitted(true);
    if (onClearSelection) onClearSelection();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(8, 11, 17, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="animate-fade-in" style={{ background: '#0e152d', border: '1px solid rgba(0, 210, 255, 0.4)', borderRadius: '20px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', color: '#fff', padding: '30px', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(0,210,255,0.2)' }}>
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
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  objectFit: 'contain',
                  border: '1.5px solid rgba(0,210,255,0.5)',
                  boxShadow: '0 0 16px rgba(0,210,255,0.35), 0 0 25px rgba(217,70,239,0.2)'
                }}
              />
              <div>
                <span style={{ background: 'rgba(0, 210, 255, 0.12)', border: '1px solid rgba(0, 210, 255, 0.3)', color: '#00d2ff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Users size={14} />
                  Multi-Creator Hire
                </span>
                <div className="logo-brand" style={{ fontSize: '1.15rem', marginLeft: '6px', verticalAlign: 'middle' }}>
                  <span className="logo-vibe" style={{ color: '#fff' }}>VIBE</span>
                  <span className="logo-now">NOWW</span>
                </div>
              </div>
            </div>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#fff', marginBottom: '16px' }}>
              Book {selectedCreators.length} Selected Creatives
            </h3>

            {/* Selected creators chips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {selectedCreators.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#141c3b', border: '1px solid rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={c.avatar} alt={c.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(0,210,255,0.4)' }} />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.title}</div>
                    </div>
                  </div>
                  <div style={{ color: '#00d2ff', fontWeight: '700', fontSize: '0.9rem' }}>
                    ₹{c.startingPrice?.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.12), rgba(217,70,239,0.08))', border: '1px solid rgba(0,210,255,0.35)', borderRadius: '12px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,210,255,0.1)' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Combined Starting Estimate</span>
              <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#00d2ff', fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em' }}>
                ₹{totalEst.toLocaleString('en-IN')}
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98412 88990"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Event Date</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Event City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onClose} className="btn btn-outline-light">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px' }}>
                  <Sparkles size={16} /> Confirm Multi-Booking
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
              Multi-Hire Confirmed!
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '440px', margin: '0 auto 24px', lineHeight: '1.6' }}>
              We have dispatched your multi-creative shoot request for {selectedCreators.length} artists. Our booking lead will coordinate schedule availability and contracts with you shortly on <strong style={{ color: 'var(--color-gold-warm)' }}>{clientPhone}</strong>.
            </p>
            <button className="btn btn-gold" onClick={() => { onClose(); onNavigate('dashboard'); }}>
              View Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
