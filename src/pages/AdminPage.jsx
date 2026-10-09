import React, { useState } from 'react';
import { ArrowLeft, Shield, CheckCircle2, Clock, User, Phone, MapPin, Calendar, DollarSign, Camera, AlertCircle, RefreshCw } from 'lucide-react';
import { useData } from '../context/DataContext';

export const AdminPage = ({ onBackToWebsite }) => {
  const { works, setWorks, photographers, setPhotographers, updateWorkStatus } = useData();

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'creators', 'overview'
  const [filterStatus, setFilterStatus] = useState('ALL');

  const handleLogin = async (e) => {
    e.preventDefault();
    const user = adminUser.trim().toLowerCase();
    const pass = adminPass.trim();

    // Check credentials via API or master verification
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user, password: pass })
      });
      const data = await res.json();
      if (data.success && data.user && data.user.role === 'ADMIN') {
        setIsAdminLoggedIn(true);
        setAdminError('');
        return;
      }
    } catch (err) {
      // Local fallback
    }

    if ((user === 'admin' || user === 'admin@vibenoww.com') && (pass === '123Hema!@#' || pass === '1234')) {
      setIsAdminLoggedIn(true);
      setAdminError('');
    } else {
      setAdminError('Invalid administrator credentials. Access restricted.');
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminUser('');
    setAdminPass('');
    setAdminError('');
  };

  const handleAssignCreator = (workId, creatorId) => {
    const creator = photographers.find(p => p.id === creatorId);
    setWorks(prev => prev.map(w => {
      if (w.id === workId) {
        return {
          ...w,
          assignedPhotographerId: creatorId,
          assignedPhotographerName: creator ? creator.name : '',
          status: w.status === 'NEW' ? 'ASSIGNED' : w.status
        };
      }
      return w;
    }));

    // Also notify backend if online
    try {
      fetch(`/api/orders/${workId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photographerId: creatorId, photographerName: creator ? creator.name : '' })
      });
    } catch (e) {}
  };

  const handleStatusChange = (workId, newStatus) => {
    updateWorkStatus(workId, newStatus);
    try {
      fetch(`/api/orders/${workId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {}
  };

  const handleApproveCreator = (creatorId, approved) => {
    setPhotographers(prev => prev.map(p => {
      if (p.id === creatorId) {
        return {
          ...p,
          status: approved ? 'APPROVED' : 'INACTIVE',
          approvalStatus: approved ? 'APPROVED' : 'REJECTED'
        };
      }
      return p;
    }));

    try {
      fetch(`/api/photographers/${creatorId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: approved ? 'ACTIVE' : 'INACTIVE', approvalStatus: approved ? 'APPROVED' : 'REJECTED' })
      });
    } catch (e) {}
  };

  // Filter orders
  const filteredWorks = works.filter(w => {
    if (filterStatus === 'ALL') return true;
    return (w.status || 'NEW').toUpperCase() === filterStatus.toUpperCase();
  });

  // Computed metrics
  const totalOrders = works.length;
  const newOrders = works.filter(w => (w.status || 'NEW') === 'NEW').length;
  const inProgressOrders = works.filter(w => ['ASSIGNED', 'CONFIRMED', 'IN_PROGRESS', 'QUOTED'].includes(w.status)).length;
  const completedOrders = works.filter(w => w.status === 'COMPLETED').length;
  const totalRevenue = works
    .filter(w => ['CONFIRMED', 'COMPLETED', 'IN_PROGRESS'].includes(w.status))
    .reduce((sum, w) => sum + (Number(w.estimatedBudget) || Number(w.quotation?.finalAmount) || 0), 0);

  if (!isAdminLoggedIn) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#090d15',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: 'var(--font-sans)'
        }}
      >
        <div
          className="animate-fade-in"
          style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: '#121622',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderTop: '3.5px solid #00f5d4',
            borderRadius: '24px',
            padding: '48px 36px 36px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
            color: '#ffffff'
          }}
        >
          {/* Brand Logo & Title */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <img
              src="/images/vibenoww-logo.png"
              alt="VibeNoww Admin"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                objectFit: 'contain',
                border: '1.5px solid rgba(0, 245, 212, 0.6)',
                boxShadow: '0 0 25px rgba(0, 245, 212, 0.4), 0 0 35px rgba(247, 37, 133, 0.25)',
                margin: '0 auto 14px',
                display: 'block'
              }}
            />
            <div className="logo-brand" style={{ fontSize: '2rem', justifyContent: 'center' }}>
              <span className="logo-vibe" style={{ color: '#fff' }}>VIBE</span>
              <span className="logo-now">NOWW</span>
              <span className="logo-dot">.</span>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                color: '#8fa0b5',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                textAlign: 'center',
                marginTop: '6px'
              }}
            >
              OPERATIONS & DISPATCH ADMIN PORTAL
            </div>
          </div>

          {adminError && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#f87171',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '0.84rem',
                marginBottom: '20px',
                textAlign: 'center'
              }}
            >
              {adminError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '22px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-sans)',
                  color: '#8fa0b5',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}
              >
                ADMIN USERNAME / EMAIL
              </label>
              <input
                type="text"
                placeholder="Enter admin email or username"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                required
                style={{
                  width: '100%',
                  backgroundColor: '#0c0f18',
                  border: '1px solid #1f2738',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-sans)',
                  color: '#8fa0b5',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}
              >
                PASSWORD
              </label>
              <input
                type="password"
                placeholder="Enter password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                required
                style={{
                  width: '100%',
                  backgroundColor: '#0c0f18',
                  border: '1px solid #1f2738',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #00f5d4 0%, #00b4d8 50%, #f72585 100%)',
                color: '#ffffff',
                fontFamily: 'var(--font-sans)',
                fontSize: '1rem',
                fontWeight: 700,
                padding: '15px 20px',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0, 245, 212, 0.35)',
                marginBottom: '26px'
              }}
            >
              Sign In to Admin Portal
            </button>
          </form>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={onBackToWebsite}
              style={{
                background: 'none',
                border: 'none',
                color: '#8fa0b5',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.88rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ArrowLeft size={15} style={{ verticalAlign: 'middle' }} />
              Back to Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Logged-in Full Admin Control Center
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#050814',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-sans)'
      }}
    >
      {/* Top Navbar */}
      <header
        style={{
          backgroundColor: '#0c1122',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '16px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="/images/vibenoww-logo.png"
            alt="VibeNoww Admin"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              objectFit: 'contain',
              border: '1.5px solid rgba(0, 245, 212, 0.6)',
              boxShadow: '0 0 14px rgba(0, 245, 212, 0.3)'
            }}
          />
          <div className="logo-brand" style={{ fontSize: '1.4rem' }}>
            <span className="logo-vibe" style={{ color: '#fff' }}>VIBE</span>
            <span className="logo-now">NOWW</span>
            <span className="logo-dot">.</span>
          </div>
          <span
            style={{
              background: 'rgba(0, 245, 212, 0.15)',
              border: '1px solid rgba(0, 245, 212, 0.35)',
              color: '#00f5d4',
              padding: '3px 10px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.05em'
            }}
          >
            DISPATCH ADMIN
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', color: '#8fa0b5' }}>Logged in as admin@vibenoww.com</span>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Log Out
          </button>
          <button
            onClick={onBackToWebsite}
            style={{
              backgroundColor: '#00f5d4',
              border: 'none',
              color: '#050814',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Back to Website
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ flex: 1, padding: '30px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* KPI Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '30px' }}>
          <div style={{ background: '#0e152d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ color: '#8fa0b5', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Total Requests</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>{totalOrders}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>All incoming customer leads</div>
          </div>

          <div style={{ background: '#0e152d', border: '1px solid rgba(0, 245, 212, 0.3)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ color: '#00f5d4', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>New / Unassigned</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#00f5d4' }}>{newOrders}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Awaiting creator assignment</div>
          </div>

          <div style={{ background: '#0e152d', border: '1px solid rgba(0, 180, 216, 0.3)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ color: '#00b4d8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>In Progress / Confirmed</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#00b4d8' }}>{inProgressOrders}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Currently handled by creators</div>
          </div>

          <div style={{ background: '#0e152d', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ color: '#22c55e', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Completed Shoots</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#22c55e' }}>{completedOrders}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Delivered & signed off</div>
          </div>

          <div style={{ background: '#0e152d', border: '1px solid rgba(247, 37, 133, 0.3)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ color: '#f72585', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Active Creators</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f72585' }}>{photographers.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Verified network talents</div>
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              background: activeTab === 'orders' ? 'rgba(0, 245, 212, 0.15)' : 'transparent',
              border: activeTab === 'orders' ? '1px solid #00f5d4' : '1px solid transparent',
              color: activeTab === 'orders' ? '#00f5d4' : '#8fa0b5',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Shoot Requests & Orders ({totalOrders})
          </button>

          <button
            onClick={() => setActiveTab('creators')}
            style={{
              background: activeTab === 'creators' ? 'rgba(0, 245, 212, 0.15)' : 'transparent',
              border: activeTab === 'creators' ? '1px solid #00f5d4' : '1px solid transparent',
              color: activeTab === 'creators' ? '#00f5d4' : '#8fa0b5',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Creators & Photographers ({photographers.length})
          </button>
        </div>

        {/* TAB 1: ORDERS & SHOOT REQUESTS */}
        {activeTab === 'orders' && (
          <div>
            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {['ALL', 'NEW', 'ASSIGNED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  style={{
                    backgroundColor: filterStatus === status ? '#00f5d4' : '#0c1122',
                    color: filterStatus === status ? '#050814' : '#8fa0b5',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px',
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>

            {filteredWorks.length === 0 ? (
              <div
                style={{
                  background: '#0c1122',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '60px 20px',
                  textAlign: 'center',
                  color: '#8fa0b5'
                }}
              >
                <Clock size={40} style={{ opacity: 0.4, margin: '0 auto 16px', display: 'block' }} />
                <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '8px' }}>No Orders in this Status</h3>
                <p style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
                  When customers submit shoot requests via the website, they will appear here in real time.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredWorks.map((work) => (
                  <div
                    key={work.id}
                    style={{
                      background: '#0c1122',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '16px',
                      padding: '24px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '20px',
                      alignItems: 'center'
                    }}
                  >
                    {/* Customer & Event Details */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#00f5d4' }}>
                          {work.workCode || work.id}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor:
                              work.status === 'COMPLETED' ? 'rgba(34, 197, 94, 0.2)' :
                              work.status === 'NEW' ? 'rgba(0, 245, 212, 0.2)' :
                              'rgba(0, 180, 216, 0.2)',
                            color:
                              work.status === 'COMPLETED' ? '#22c55e' :
                              work.status === 'NEW' ? '#00f5d4' :
                              '#00b4d8'
                          }}
                        >
                          {work.status || 'NEW'}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                        {work.clientName || work.customerName}
                      </h4>
                      <div style={{ fontSize: '0.85rem', color: '#8fa0b5', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span>📞 {work.clientPhone || work.customerPhone}</span>
                        {work.clientEmail && <span>✉️ {work.clientEmail}</span>}
                      </div>

                      <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                        <strong>Event:</strong> {work.eventType} • <strong>Date:</strong> {work.eventDate || work.shootDate}
                        {work.location && <span> • <strong>Location:</strong> {work.location}</span>}
                      </div>
                    </div>

                    {/* Creator Assignment */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#8fa0b5', textTransform: 'uppercase', marginBottom: '6px' }}>
                        ASSIGN CREATOR
                      </label>
                      <select
                        value={work.assignedPhotographerId || ''}
                        onChange={(e) => handleAssignCreator(work.id, e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#12182b',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          color: '#ffffff',
                          fontSize: '0.85rem',
                          outline: 'none'
                        }}
                      >
                        <option value="">-- Select Creator / Photographer --</option>
                        {photographers.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.studioName || p.location})
                          </option>
                        ))}
                      </select>

                      {work.assignedPhotographerName && (
                        <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#00f5d4' }}>
                          ✓ Assigned to: {work.assignedPhotographerName}
                        </div>
                      )}
                    </div>

                    {/* Status Update & Actions */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#8fa0b5', textTransform: 'uppercase', marginBottom: '6px' }}>
                        UPDATE WORK STATUS
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                          value={work.status || 'NEW'}
                          onChange={(e) => handleStatusChange(work.id, e.target.value)}
                          style={{
                            flex: 1,
                            backgroundColor: '#12182b',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '8px',
                            padding: '10px 12px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                            outline: 'none'
                          }}
                        >
                          <option value="NEW">NEW</option>
                          <option value="ASSIGNED">ASSIGNED</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>

                        {work.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleStatusChange(work.id, 'COMPLETED')}
                            style={{
                              backgroundColor: '#22c55e',
                              border: 'none',
                              color: '#fff',
                              borderRadius: '8px',
                              padding: '10px 14px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CREATORS */}
        {activeTab === 'creators' && (
          <div>
            {photographers.length === 0 ? (
              <div
                style={{
                  background: '#0c1122',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '60px 20px',
                  textAlign: 'center',
                  color: '#8fa0b5'
                }}
              >
                <Camera size={40} style={{ opacity: 0.4, margin: '0 auto 16px', display: 'block' }} />
                <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '8px' }}>Zero Creators Registered</h3>
                <p style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
                  The new production database is completely clean. When photographers register via the "Register as New Artist" button, their applications will appear here for admin approval.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {photographers.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      background: '#0c1122',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '16px',
                      padding: '20px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <img
                        src={p.avatar || '/images/vibenoww-logo.png'}
                        alt={p.name}
                        style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{p.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#8fa0b5' }}>{p.studioName || p.location}</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '16px' }}>
                      <div>📞 {p.phone || p.mobile}</div>
                      <div>📍 {p.location}</div>
                      <div>💰 Starting at ₹{p.startingPrice || 15000}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {(p.status !== 'APPROVED' && p.approvalStatus !== 'APPROVED') ? (
                        <button
                          onClick={() => handleApproveCreator(p.id, true)}
                          style={{
                            flex: 1,
                            backgroundColor: '#22c55e',
                            border: 'none',
                            color: '#fff',
                            borderRadius: '8px',
                            padding: '8px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApproveCreator(p.id, false)}
                          style={{
                            flex: 1,
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            color: '#f87171',
                            borderRadius: '8px',
                            padding: '8px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
