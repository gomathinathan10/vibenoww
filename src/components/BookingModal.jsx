import React, { useState } from 'react';
import { X, Calendar, MapPin, User, Phone, Mail, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useData } from '../context/DataContext';

export const BookingModal = ({ isOpen, onClose, selectedPhotographer = null, initialEventType = 'Wedding', initialServiceType = 'Photo + Video', onNavigate }) => {
  const { createOrder } = useData();
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [eventType, setEventType] = useState(initialEventType);
  const [serviceType, setServiceType] = useState(initialServiceType);
  const [eventDate, setEventDate] = useState('2026-11-25');
  const [location, setLocation] = useState('Tirunelveli, Tamil Nadu');
  const [venue, setVenue] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      alert('Please fill in your name and phone number.');
      return;
    }

    createOrder({
      clientName,
      clientPhone,
      clientEmail,
      eventType,
      eventDate,
      location,
      venue,
      requiredServices: [serviceType],
      assignedPhotographerId: selectedPhotographer ? selectedPhotographer.id : null,
      estimatedBudget: selectedPhotographer ? selectedPhotographer.startingPrice : 25000,
      notes,
      quotation: {
        photographyCharge: selectedPhotographer ? selectedPhotographer.startingPrice : 25000,
        additionalHours: 0,
        travelCharge: 0,
        equipmentCharge: 0,
        editingCharge: 0,
        discount: 0,
        finalAmount: selectedPhotographer ? selectedPhotographer.startingPrice : 25000,
        quotationNotes: `Direct Booking Inquiry for ${selectedPhotographer ? selectedPhotographer.name : 'VibeNoww Verified Creator'}.`
      }
    });

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    setSubmitted(true);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(8, 11, 17, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="animate-fade-in" style={{ background: '#0e152d', border: '1px solid rgba(0, 210, 255, 0.4)', borderRadius: '20px', maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', color: '#fff', padding: '30px', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(0,210,255,0.2)' }}>
        
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
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  objectFit: 'contain',
                  border: '1.5px solid rgba(0,210,255,0.5)',
                  boxShadow: '0 0 16px rgba(0,210,255,0.35), 0 0 25px rgba(217,70,239,0.2)'
                }}
              />
              <div>
                <span style={{ background: 'rgba(0, 210, 255, 0.12)', border: '1px solid rgba(0, 210, 255, 0.3)', color: '#00d2ff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: '700', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <ShieldCheck size={14} />
                  Verified Escrow Booking
                </span>
                <div className="logo-brand" style={{ fontSize: '1.15rem', marginLeft: '6px', verticalAlign: 'middle' }}>
                  <span className="logo-vibe" style={{ color: '#fff' }}>VIBE</span>
                  <span className="logo-now">NOWW</span>
                </div>
              </div>
            </div>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#fff', marginBottom: '6px' }}>
              {selectedPhotographer ? `Book ${selectedPhotographer.name}` : 'Book Free Consultation / Shoot'}
            </h3>
            
            {selectedPhotographer && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#182032', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px' }}>
                <img src={selectedPhotographer.avatar} alt={selectedPhotographer.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{selectedPhotographer.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Starting from ₹{selectedPhotographer.startingPrice?.toLocaleString('en-IN')} {selectedPhotographer.priceUnit}</div>
                </div>
              </div>
            )}

            <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '20px' }}>
              Reserve your dates with verified talent guarantee. Our team coordinates contracts, equipment check, and schedule.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senthil Kumar"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Phone / WhatsApp *</label>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Event Category</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }}
                  >
                    <option value="Wedding">Traditional & Candid Wedding</option>
                    <option value="Pre-Wedding">Pre-Wedding / Couple Shoot</option>
                    <option value="Reception">Reception / Sangeet</option>
                    <option value="Maternity & Baby">Maternity & Baby Shoot</option>
                    <option value="Commercial">Brand Commercial / Lookbook</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Event Date</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>City / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Tirunelveli / Chennai"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Venue / Hall (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Sri Ram Mahal, Palayamkottai"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Special Requirements / Message</label>
                <textarea
                  rows="3"
                  placeholder="Tell us about your timing, style preferences, number of guests..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onClose} className="btn btn-outline-light">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px' }}>
                  <Sparkles size={16} /> Confirm Booking Request
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(34,197,94,0.15)', color: '#4ade80', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#fff', marginBottom: '12px' }}>
              Booking Request Received!
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '440px', margin: '0 auto 24px', lineHeight: '1.6' }}>
              Thank you, <strong style={{ color: '#fff' }}>{clientName}</strong>. Your shoot request has been logged. Our booking coordinator will reach out to you within 2 business hours on <strong style={{ color: 'var(--color-gold-warm)' }}>{clientPhone}</strong>.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
              <button
                className="btn btn-gold"
                onClick={() => {
                  onClose();
                  onNavigate('dashboard');
                }}
              >
                View in Dashboard
              </button>
              <button className="btn btn-outline-light" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
