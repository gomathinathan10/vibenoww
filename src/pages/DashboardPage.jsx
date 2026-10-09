import React, { useState, useRef } from 'react';
import {
  Sparkles, Camera, User, Calendar, CheckCircle2, Clock,
  FileText, Plus, ShieldCheck, DollarSign, Send, Star, AlertCircle, Upload, Crop
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { ImageCropModal } from '../components/ImageCropModal';

export const DashboardPage = ({ onAddNew, onOpenLogin, onOpenRegister, onViewProfile, onNavigate }) => {
  const { currentUser, works, photographers, submitWorkQuotation, updateWorkStatus, updatePhotographerProfile, logout } = useData();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'leads', 'profile'
  const [quoteNotes, setQuoteNotes] = useState('');
  const [quoteAmount, setQuoteAmount] = useState('');
  const [activeQuotingWorkId, setActiveQuotingWorkId] = useState(null);

  // Avatar cropping state
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [rawImageToCrop, setRawImageToCrop] = useState('');
  const fileInputRef = useRef(null);

  const handleAvatarFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawImageToCrop(ev.target.result);
      setIsCropOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropSaved = async (croppedDataUrl) => {
    setIsCropOpen(false);
    if (currentUser) {
      if (updatePhotographerProfile) {
        updatePhotographerProfile(currentUser.id, { avatar: croppedDataUrl, image: croppedDataUrl });
      }
      try {
        await fetch(`/api/photographers/${currentUser.id}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-creator-id': currentUser.id },
          body: JSON.stringify({ image: croppedDataUrl, type: 'avatar' })
        });
      } catch (err) {}
    }
  };

  // If user is not logged in, show portal prompt with instant demo login options
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-ivory)', color: 'var(--color-text-dark)', paddingTop: '100px', paddingBottom: '80px' }}>
        <div className="container" style={{ maxWidth: '800px', textAlign: 'center' }}>
          
          <div style={{ background: '#fff', borderRadius: '24px', padding: '50px 40px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-border-subtle)' }}>
            <img
              src="/images/vibenoww-logo.png"
              alt="VibeNoww Logo"
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '18px',
                objectFit: 'contain',
                border: '2px solid rgba(0, 210, 255, 0.5)',
                boxShadow: '0 0 25px rgba(0, 210, 255, 0.4), 0 0 40px rgba(217, 70, 239, 0.25)',
                margin: '0 auto 20px',
                display: 'block'
              }}
            />

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--color-text-dark)', marginBottom: '12px' }}>
              VibeNoww Creator Studio
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', maxWidth: '540px', margin: '0 auto 30px', lineHeight: '1.6' }}>
              Sign in to manage client shoot requests, submit instant proposal quotations, track escrow payouts, and update your verified photography portfolio.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '40px' }}>
              <button className="btn btn-gold" onClick={onOpenLogin} style={{ padding: '12px 28px' }}>
                <Camera size={16} /> Sign In to Creator Studio
              </button>
              <button className="btn btn-outline-dark" onClick={onOpenRegister} style={{ padding: '12px 28px' }}>
                <ShieldCheck size={16} /> Register as New Artist
              </button>
            </div>


          </div>

        </div>
      </div>
    );
  }

  // Handle quote submit
  const handleSendQuote = (workId) => {
    if (!quoteAmount) {
      alert('Please enter a quote amount.');
      return;
    }

    submitWorkQuotation(workId, {
      photographyCharge: Number(quoteAmount),
      additionalHours: 0,
      travelCharge: 0,
      equipmentCharge: 0,
      editingCharge: 0,
      discount: 0,
      finalAmount: Number(quoteAmount),
      quotationNotes: quoteNotes || `Official proposal quote from ${currentUser.name}.`
    });

    setActiveQuotingWorkId(null);
    setQuoteAmount('');
    setQuoteNotes('');
    alert('Proposal Quote Sent to Client!');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-ivory)', color: 'var(--color-text-dark)', paddingTop: '90px', paddingBottom: '90px' }}>
      
      {/* Studio Header Bar */}
      <section style={{ background: '#080b11', color: '#fff', padding: '40px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={currentUser.name}
                  style={{ width: '70px', height: '70px', borderRadius: '20px', border: '3px solid #182032', objectFit: 'cover' }}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarFile}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload & Crop Profile Photo"
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    background: 'linear-gradient(135deg, #00d2ff, #7928ca)',
                    border: '2px solid #080b11',
                    color: '#fff',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(0, 210, 255, 0.5)'
                  }}
                >
                  <Crop size={14} />
                </button>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#fff', margin: 0 }}>
                    {currentUser.name}
                  </h1>
                  <span style={{ background: 'rgba(0, 210, 255, 0.15)', border: '1px solid rgba(0, 210, 255, 0.35)', color: '#00d2ff', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                    Verified Studio
                  </span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '4px 0 0' }}>
                  {currentUser.title} • {currentUser.location}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-outline-light btn-sm"
                onClick={() => {
                  if (currentUser?.avatar) {
                    setRawImageToCrop(currentUser.avatar);
                    setIsCropOpen(true);
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Crop size={14} /> Crop Profile Photo
              </button>
              <button className="btn btn-gold btn-sm" onClick={onAddNew}>
                <Plus size={14} /> New Client Shoot Request
              </button>
              <button className="btn btn-outline-light btn-sm" onClick={logout}>
                Log Out
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Main Studio Body */}
      <section style={{ padding: '40px 0' }}>
        <div className="container">
          
          {/* Quick Metrics */}
          {(() => {
            const myAssignedOrders = works.filter(w => 
              w.assignedPhotographerId === currentUser?.id ||
              w.assignedPhotographerId === currentUser?.photographerId ||
              String(w.assignedPhotographerId) === String(currentUser?.id) ||
              String(w.assignedPhotographerId) === String(currentUser?.userId) ||
              (w.assignedPhotographerName && currentUser?.name && w.assignedPhotographerName.toLowerCase() === currentUser.name.toLowerCase())
            );
            const openLeads = works.filter(w => !w.assignedPhotographerId || w.status === 'NEW');

            return (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '30px' }}>
                  <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid var(--color-border-subtle)' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>My Assigned Shoots</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-text-dark)', marginTop: '4px' }}>
                      {myAssignedOrders.filter(w => ['CONFIRMED', 'ASSIGNED', 'IN_PROGRESS'].includes(w.status)).length}
                    </div>
                  </div>
                  <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid var(--color-border-subtle)' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Proposal Quotes</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#00d2ff', marginTop: '4px' }}>
                      {myAssignedOrders.filter(w => w.status === 'QUOTED').length}
                    </div>
                  </div>
                  <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid var(--color-border-subtle)' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Studio Rating</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#00d2ff', marginTop: '4px' }}>
                      {currentUser.rating || 5.0} ★
                    </div>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border-subtle)', gap: '20px', marginBottom: '24px' }}>
                  <button
                    onClick={() => setActiveTab('orders')}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === 'orders' ? '3px solid var(--color-gold-warm)' : '3px solid transparent',
                      padding: '10px 4px',
                      fontWeight: activeTab === 'orders' ? '700' : '500',
                      color: activeTab === 'orders' ? 'var(--color-text-dark)' : '#64748b',
                      cursor: 'pointer',
                      fontSize: '0.95rem'
                    }}
                  >
                    My Assigned Shoots ({myAssignedOrders.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('leads')}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === 'leads' ? '3px solid var(--color-gold-warm)' : '3px solid transparent',
                      padding: '10px 4px',
                      fontWeight: activeTab === 'leads' ? '700' : '500',
                      color: activeTab === 'leads' ? 'var(--color-text-dark)' : '#64748b',
                      cursor: 'pointer',
                      fontSize: '0.95rem'
                    }}
                  >
                    Available Gigs & Leads ({openLeads.length})
                  </button>
                </div>

                {/* Tab 1: Orders */}
                {activeTab === 'orders' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {myAssignedOrders.length === 0 ? (
                      <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        No shoots assigned by admin yet. Once an order is assigned to you, it will appear here automatically.
                      </div>
                    ) : (
                      myAssignedOrders.map((work) => (
                  <div
                    key={work.id}
                    style={{
                      background: '#fff',
                      borderRadius: '16px',
                      padding: '24px',
                      border: '1px solid var(--color-border-subtle)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--color-text-dark)' }}>
                            {work.clientName}
                          </span>
                          <span style={{
                            background: work.status === 'CONFIRMED' ? 'rgba(34,197,94,0.15)' : work.status === 'QUOTED' ? 'rgba(229,184,66,0.2)' : 'rgba(100,116,139,0.15)',
                            color: work.status === 'CONFIRMED' ? '#16a34a' : work.status === 'QUOTED' ? 'var(--color-gold-dark)' : '#475569',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '700'
                          }}>
                            {work.status}
                          </span>
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                          📞 {work.clientPhone} • 📅 {work.eventDate} • 📍 {work.location}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Budget / Total</span>
                        <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-gold-dark)', fontFamily: 'var(--font-serif)' }}>
                          ₹{(work.quotation?.finalAmount || work.estimatedBudget || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Service tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      {work.requiredServices?.map((s, i) => (
                        <span key={i} style={{ background: 'var(--color-ivory-warm)', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '500' }}>
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Order ID: #{work.id} • Created: {work.createdAt}
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {work.status !== 'CONFIRMED' && (
                          <button
                            className="btn btn-outline-dark btn-sm"
                            onClick={() => updateWorkStatus(work.id, 'CONFIRMED', 'Confirmed by creator')}
                          >
                            Mark Confirmed
                          </button>
                        )}
                        {work.status === 'CONFIRMED' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => updateWorkStatus(work.id, 'COMPLETED', 'Deliverables completed')}
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Leads & Quotation Submissions */}
          {activeTab === 'leads' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid var(--color-border-subtle)' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '6px' }}>
                  Open Shoot Requirements in South India
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '20px' }}>
                  Send direct proposal quotes with equipment details and your custom rates.
                </p>

                {works.map((lead) => (
                  <div key={lead.id} style={{ background: 'var(--color-cream-card)', borderRadius: '12px', padding: '18px', marginBottom: '14px', border: '1px solid var(--color-border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div>
                        <strong style={{ fontSize: '1rem', color: 'var(--color-text-dark)' }}>{lead.eventType}</strong>
                        <div style={{ color: '#64748b', fontSize: '0.82rem' }}>Date: {lead.eventDate} • Location: {lead.location}</div>
                      </div>
                      <span style={{ fontWeight: '700', color: 'var(--color-gold-dark)' }}>
                        Client Est: ₹{lead.estimatedBudget?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {activeQuotingWorkId === lead.id ? (
                      <div style={{ background: '#fff', padding: '16px', borderRadius: '10px', marginTop: '12px', border: '1px solid var(--color-border-subtle)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginBottom: '10px' }}>
                          <input
                            type="number"
                            placeholder="Your Proposal Rate (₹)"
                            value={quoteAmount}
                            onChange={(e) => setQuoteAmount(e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.15)', outline: 'none' }}
                          />
                          <input
                            type="text"
                            placeholder="Proposal notes (e.g. 2 crew, 4K Sony FX3, 200 edited photos)..."
                            value={quoteNotes}
                            onChange={(e) => setQuoteNotes(e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.15)', outline: 'none' }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button className="btn btn-outline-dark btn-sm" onClick={() => setActiveQuotingWorkId(null)}>
                            Cancel
                          </button>
                          <button className="btn btn-primary btn-sm" onClick={() => handleSendQuote(lead.id)}>
                            <Send size={14} /> Send Proposal Quote
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="btn btn-gold btn-sm"
                        onClick={() => {
                          setActiveQuotingWorkId(lead.id);
                          setQuoteAmount(lead.estimatedBudget || 25000);
                        }}
                      >
                        Submit Proposal Quote
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

              </>
            );
          })()}
        </div>
      </section>

      {/* Interactive Image Cropper Modal */}
      <ImageCropModal
        isOpen={isCropOpen}
        imageSrc={rawImageToCrop}
        title="Crop Studio Profile Photo"
        subtitle={`Adjust framing and zoom for ${currentUser?.name || 'Creator'}`}
        onCropComplete={handleCropSaved}
        onCancel={() => setIsCropOpen(false)}
      />

    </div>
  );
};
