import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, MessageSquare, Clock, CheckCircle2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useData } from '../context/DataContext';

export const ContactPage = ({ onNavigate }) => {
  const { createOrder } = useData();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState('Wedding Photography');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Please provide your name and phone number.');
      return;
    }

    createOrder({
      clientName: name,
      clientPhone: phone,
      clientEmail: email,
      eventType: service,
      eventDate: '2026-11-30',
      location: 'Tamil Nadu',
      notes: message,
      estimatedBudget: 25000,
      quotation: {
        photographyCharge: 25000,
        additionalHours: 0,
        travelCharge: 0,
        equipmentCharge: 0,
        editingCharge: 0,
        discount: 0,
        finalAmount: 25000,
        quotationNotes: `Direct Contact Inquiry: ${message}`
      }
    });

    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (err) {}

    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: 'var(--color-text-dark)', paddingTop: '90px', paddingBottom: '90px' }}>
      
      {/* Header Banner */}
      <section style={{ background: '#080b11', color: '#fff', padding: '50px 0 60px' }}>
        <div className="container">
          <div style={{ maxWidth: '720px' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.4rem, 4vw, 3.4rem)', fontWeight: '800', marginTop: '12px', marginBottom: '12px', color: '#fff' }}>
              Let's Plan Your Dream Visual Shoot
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.6' }}>
              Have questions about customized packages, photographer availability, or commercial brand shoots? Our creative talent team is here to assist.
            </p>
          </div>
        </div>
      </section>

      {/* Main Contact Grid */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px' }}>
            
            {/* Left Contact Form */}
            <div style={{ background: 'var(--color-cream-card)', borderRadius: '24px', padding: '40px', border: '1px solid var(--color-border-subtle)' }}>
              {!submitted ? (
                <form onSubmit={handleSubmit}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--color-text-dark)', marginBottom: '8px' }}>
                    Send Us An Inquiry
                  </h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                    Fill out the form and our booking team will reach out on WhatsApp within 2 hours.
                  </p>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '6px', fontWeight: '600' }}>Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Sundaram"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.12)', background: '#fff', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '6px', fontWeight: '600' }}>Phone / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98412 88990"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.12)', background: '#fff', fontSize: '0.9rem', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '6px', fontWeight: '600' }}>Email Address</label>
                      <input
                        type="email"
                        placeholder="you@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.12)', background: '#fff', fontSize: '0.9rem', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '6px', fontWeight: '600' }}>Service of Interest</label>
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.12)', background: '#fff', fontSize: '0.9rem', outline: 'none' }}
                    >
                      <option value="Wedding Photography">Wedding Photography & Cinematography</option>
                      <option value="Pre-Wedding Shoot">Pre-Wedding / Couple Shoot</option>
                      <option value="Drone Videography">Drone Aerial & FPV Shoot</option>
                      <option value="Commercial / Fashion">Brand Commercial / Product Catalog</option>
                      <option value="Maternity & Baby">Maternity & Baby Shoot</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '6px', fontWeight: '600' }}>Message / Event Details</label>
                    <textarea
                      rows="3"
                      placeholder="Tell us about the event date, venue, or budget expectations..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.12)', background: '#fff', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                    <Send size={16} /> Submit Inquiry
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                  <div style={{ width: '60px', height: '60px', background: 'rgba(34,197,94,0.15)', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--color-text-dark)', marginBottom: '10px' }}>
                    Inquiry Received!
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px' }}>
                    Thank you, {name}. Our creative lead will contact you shortly on <strong>{phone}</strong>.
                  </p>
                  <button className="btn btn-gold" onClick={() => setSubmitted(false)}>
                    Send Another Note
                  </button>
                </div>
              )}
            </div>

            {/* Right Info Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ background: '#0e152d', border: '1px solid rgba(0, 210, 255, 0.3)', color: '#fff', borderRadius: '20px', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <img src="/images/vibenoww-logo.png" alt="VibeNoww" style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'contain', border: '1px solid rgba(0,210,255,0.5)', boxShadow: '0 0 14px rgba(0,210,255,0.35)' }} />
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                      Direct Contact Hub
                    </h3>
                    <div style={{ fontSize: '0.72rem', color: '#00d2ff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      VibeNoww Creative Network
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.95rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Phone size={18} style={{ color: '#00d2ff' }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Call / WhatsApp Support</div>
                      <a href="tel:+917708320321" style={{ color: '#fff', fontWeight: '700' }}>+91 7708320321</a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Mail size={18} style={{ color: '#00d2ff' }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Official Email</div>
                      <a href="mailto:vibenoww26@gmail.com" style={{ color: '#fff', fontWeight: '700' }}>vibenoww26@gmail.com</a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <MapPin size={18} style={{ color: '#00d2ff', marginTop: '4px' }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Studio Hubs</div>
                      <div style={{ color: '#cbd5e1' }}>Balabackiya Nagar, Thachanallur, Tirunelveli</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--color-ivory)', borderRadius: '20px', padding: '30px', border: '1px solid var(--color-border-subtle)' }}>
                <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15rem', fontWeight: '700', marginBottom: '10px' }}>
                  ⚡ Instant WhatsApp Quotations
                </h4>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '18px' }}>
                  Need instant photographer availability for an upcoming wedding date or commercial shoot? Message our team directly.
                </p>
                <a
                  href="https://wa.me/917708320321?text=Hi%20VibeNoww%2C%20I%20would%20like%20to%20inquire%20about%20booking%20photographers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-gold btn-sm"
                  style={{ display: 'inline-flex' }}
                >
                  <MessageSquare size={16} /> Chat on WhatsApp
                </a>
              </div>

            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
