import React, { useState, useRef } from 'react';
import { X, Camera, Lock, User, MapPin, Sparkles, CheckCircle2, Upload, Crop } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useData } from '../context/DataContext';
import { ImageCropModal } from './ImageCropModal';

export const CreatorAuthModal = ({ isOpen, onClose, initialMode = 'login', onNavigate }) => {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const { loginUser, registerCreator } = useData();

  // Login form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regTitle, setRegTitle] = useState('Cinematic Wedding Photographer');
  const [regCategory, setRegCategory] = useState('photographer');
  const [regLocation, setRegLocation] = useState('Tirunelveli, Tamil Nadu');
  const [regPhone, setRegPhone] = useState('');
  const [regPrice, setRegPrice] = useState(20000);
  const [regBio, setRegBio] = useState('');
  const [regAvatar, setRegAvatar] = useState('');
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [rawImageToCrop, setRawImageToCrop] = useState('');
  const fileInputRef = useRef(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = loginUser(username, password);
    if (res.success) {
      onClose();
      onNavigate('dashboard');
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!regName || !regPhone) {
      setErrorMsg('Please provide your studio name and mobile number.');
      return;
    }

    registerCreator({
      username: regName.toLowerCase().replace(/\s+/g, ''),
      password: '123',
      name: regName,
      title: regTitle,
      category: regCategory,
      location: regLocation,
      startingPrice: Number(regPrice),
      priceUnit: regCategory === 'editor' ? 'per project' : 'per day',
      avatar: regAvatar,
      bio: regBio || 'Passionate visual artist delivering creative wedding and commercial experiences across Tamil Nadu.',
      specialties: [regTitle, 'Candid Moments', 'High-Res Delivery']
    });

    try {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    setRegisteredSuccess(true);
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, or WEBP).');
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

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(8, 11, 17, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="animate-fade-in" style={{ background: '#0e152d', border: '1px solid rgba(0, 210, 255, 0.4)', borderRadius: '24px', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto', color: '#fff', padding: '32px', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(0,210,255,0.2)' }}>
        
        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={18} />
        </button>

        {!registeredSuccess ? (
          <div>
            {/* Top Brand Logo Emblem */}
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <img
                src="/images/vibenoww-logo.png"
                alt="VibeNoww Logo"
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  objectFit: 'contain',
                  border: '1.5px solid rgba(0,210,255,0.6)',
                  boxShadow: '0 0 25px rgba(0,210,255,0.4), 0 0 35px rgba(217,70,239,0.25)',
                  margin: '0 auto 12px',
                  display: 'block'
                }}
              />
              <div className="logo-brand" style={{ fontSize: '1.45rem', justifyContent: 'center' }}>
                <span className="logo-vibe" style={{ color: '#fff' }}>VIBE</span>
                <span className="logo-now">NOWW</span>
                <span className="logo-dot">.</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: '700', marginTop: '2px' }}>
                Creator Studio Network
              </div>
            </div>

            {/* Header Tabs */}
            <div style={{ display: 'flex', gap: '10px', background: '#141c3b', padding: '4px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(''); }}
                style={{
                  flex: 1,
                  background: mode === 'login' ? 'linear-gradient(135deg, #00d2ff 0%, #0072ff 50%, #7928ca 100%)' : 'transparent',
                  color: mode === 'login' ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: mode === 'login' ? '0 4px 16px rgba(0,210,255,0.35)' : 'none',
                  transition: 'all 0.25s'
                }}
              >
                Creator Login
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMsg(''); }}
                style={{
                  flex: 1,
                  background: mode === 'register' ? 'linear-gradient(135deg, #00d2ff 0%, #0072ff 50%, #7928ca 100%)' : 'transparent',
                  color: mode === 'register' ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: mode === 'register' ? '0 4px 16px rgba(0,210,255,0.35)' : 'none',
                  transition: 'all 0.25s'
                }}
              >
                Join as Creator
              </button>
            </div>

            {errorMsg && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '16px' }}>
                {errorMsg}
              </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLogin}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#fff', marginBottom: '6px' }}>
                  Creator Studio Login
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Access your booked gigs, proposal quotations, and portfolio dashboard.
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Username / Creator Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. karthik"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Demo logins: <code>karthik</code>, <code>ananya</code>, <code>suresh</code>, <code>priya</code></span>
                </div>

                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Demo: 123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                  <Camera size={16} /> Sign In to Creator Studio
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#fff', marginBottom: '6px' }}>
                  Join the Verified Network
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Connect with premium wedding and commercial clients across Tamil Nadu.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Your Name / Studio *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vignesh Raja"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Role Category</label>
                    <select
                      value={regCategory}
                      onChange={(e) => setRegCategory(e.target.value)}
                      style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }}
                    >
                      <option value="photographer">Photographer</option>
                      <option value="cinematographer">Cinematographer / Filmmaker</option>
                      <option value="drone_pilot">FPV / Drone Pilot</option>
                      <option value="editor">Colorist / Video Editor</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Base City</label>
                    <input
                      type="text"
                      value={regLocation}
                      onChange={(e) => setRegLocation(e.target.value)}
                      placeholder="e.g. Tirunelveli"
                      style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Starting Rate (₹)</label>
                    <input
                      type="number"
                      value={regPrice}
                      onChange={(e) => setRegPrice(e.target.value)}
                      style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Mobile / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98412 88990"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
                    Profile Photo (Crop & Frame)
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarFileChange}
                    style={{ display: 'none' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#182032', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px 14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#0e152d', border: '2px solid #00d2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {regAvatar ? (
                        <img src={regAvatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Camera size={20} color="#00d2ff" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#fff', fontWeight: '600' }}>
                        {regAvatar ? 'Photo Cropped & Ready ✓' : 'Upload & Crop Avatar'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        JPG, PNG, or WEBP (Square/Circle Cropper)
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ background: 'rgba(0, 210, 255, 0.2)', border: '1px solid #00d2ff', color: '#00d2ff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Upload size={12} /> {regAvatar ? 'Change' : 'Choose'}
                      </button>
                      {regAvatar && (
                        <button
                          type="button"
                          onClick={() => {
                            setRawImageToCrop(regAvatar);
                            setIsCropOpen(true);
                          }}
                          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px 10px', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Crop size={12} /> Crop
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Short Bio / Equipment Summary</label>
                  <textarea
                    rows="2"
                    placeholder="e.g. 5 years experience in wedding and candid shoots, Sony A7M4..."
                    value={regBio}
                    onChange={(e) => setRegBio(e.target.value)}
                    style={{ width: '100%', background: '#182032', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 14px', borderRadius: '10px', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <button type="submit" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                  <Sparkles size={16} /> Complete Creator Registration
                </button>
              </form>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 10px' }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(34,197,94,0.15)', color: '#4ade80', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#fff', marginBottom: '10px' }}>
              Welcome to VibeNoww!
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>
              Your creator profile has been initialized. You are now logged in and can manage leads, proposals, and bookings.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onNavigate('dashboard');
              }}
            >
              Go to Creator Dashboard
            </button>
          </div>
        )}

        {/* Interactive Image Cropper Modal */}
        <ImageCropModal
          isOpen={isCropOpen}
          imageSrc={rawImageToCrop}
          title="Crop Profile Picture"
          subtitle="Position and zoom your photo for your creator profile"
          onCropComplete={(croppedDataUrl) => {
            setRegAvatar(croppedDataUrl);
            setIsCropOpen(false);
          }}
          onCancel={() => setIsCropOpen(false)}
        />

      </div>
    </div>
  );
};
