import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { PortfolioPage } from './pages/PortfolioPage';
import { ServicesPage } from './pages/ServicesPage';
import { PhotographersPage } from './pages/PhotographersPage';
import { DashboardPage } from './pages/DashboardPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';

import { QuotationModal } from './components/QuotationModal';
import { BookingModal } from './components/BookingModal';
import { MultiBookingModal } from './components/MultiBookingModal';
import { PhotographerProfileModal } from './components/PhotographerProfileModal';
import { LightboxModal } from './components/LightboxModal';
import { CreatorAuthModal } from './components/CreatorAuthModal';

import { ArrowRight } from 'lucide-react';
import { useData } from './context/DataContext';

export const App = () => {
  const { publicApprovedPhotographers } = useData();

  // Active page tab ('browse', 'portfolio', 'services', 'select-photographers', 'about', 'dashboard', 'contact', 'admin')
  const [activeTab, setActiveTab] = useState('browse');

  // Selected photographers for multi-hire
  const [selectedCreators, setSelectedCreators] = useState([]);

  // Modal states
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isMultiBookingModalOpen, setIsMultiBookingModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [selectedPhotographerForProfile, setSelectedPhotographerForProfile] = useState(null);
  const [selectedPhotographerForBooking, setSelectedPhotographerForBooking] = useState(null);
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);

  // Booking initial props
  const [bookingEvent, setBookingEvent] = useState('Wedding');
  const [bookingService, setBookingService] = useState('Photo + Video');

  const closeAllModals = () => {
    setIsQuotationModalOpen(false);
    setIsBookingModalOpen(false);
    setIsMultiBookingModalOpen(false);
    setIsAuthModalOpen(false);
    setSelectedPhotographerForProfile(null);
    setSelectedPhotographerForBooking(null);
    setActiveLightboxImg(null);
  };

  const handleOpenBookNow = (photogOrEvent = null, serviceType = 'Photo + Video') => {
    if (photogOrEvent && typeof photogOrEvent === 'object') {
      setSelectedPhotographerForBooking(photogOrEvent);
      setBookingEvent('Wedding');
      setBookingService('Photo + Video');
    } else {
      setSelectedPhotographerForBooking(null);
      setBookingEvent(typeof photogOrEvent === 'string' ? photogOrEvent : 'Wedding');
      setBookingService(serviceType || 'Photo + Video');
    }
    setIsBookingModalOpen(true);
  };

  // Hash route parsing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '').trim();
      if (hash === 'admin') {
        setActiveTab('admin');
      } else if (hash === 'about' || hash === 'how-it-works') {
        setActiveTab('about');
      } else if (hash === 'services' || hash === 'for-business') {
        setActiveTab('services');
      } else if (hash === 'portfolio' || hash === 'for-moments') {
        setActiveTab('portfolio');
      } else if (hash === 'select-photographers' || hash === 'creatives' || hash === 'explore') {
        setActiveTab('select-photographers');
      } else if (hash === 'contact') {
        setActiveTab('contact');
      } else if (hash === 'dashboard' || hash === 'creators' || hash === 'for-creators') {
        setActiveTab('dashboard');
      } else {
        setActiveTab('browse');
      }
      closeAllModals();
    };

    if (window.location.hash) {
      handleHashChange();
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (tab) => {
    setActiveTab(tab);
    if (tab === 'browse') window.location.hash = '#/';
    else window.location.hash = `#/${tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeAllModals();
  };

  // If on admin page
  if (activeTab === 'admin') {
    return <AdminPage onBackToWebsite={() => navigateTo('browse')} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: 'var(--color-text-dark)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={navigateTo}
        onOpenRegister={() => { setAuthMode('register'); setIsAuthModalOpen(true); }}
        onOpenCreatorLogin={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
        onOpenEstimateModal={() => setIsQuotationModalOpen(true)}
        onOpenBookNow={handleOpenBookNow}
      />

      {/* Main Pages */}
      <main style={{ flexGrow: 1 }}>
        {activeTab === 'browse' && (
          <HomePage
            selectedCreators={selectedCreators}
            setSelectedCreators={setSelectedCreators}
            onViewProfile={(p) => setSelectedPhotographerForProfile(p)}
            onBookNow={handleOpenBookNow}
            onNavigate={navigateTo}
            onOpenEstimate={() => setIsQuotationModalOpen(true)}
            onOpenMultiBooking={() => setIsMultiBookingModalOpen(true)}
            setActiveLightboxImg={setActiveLightboxImg}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioPage
            creators={publicApprovedPhotographers}
            onViewProfile={(p) => setSelectedPhotographerForProfile(p)}
            onRequestPhotographer={handleOpenBookNow}
            onOpenBookNow={handleOpenBookNow}
            setActiveLightboxImg={setActiveLightboxImg}
            onNavigate={navigateTo}
          />
        )}

        {activeTab === 'services' && (
          <ServicesPage
            onNavigate={navigateTo}
            onOpenBookNow={handleOpenBookNow}
            onOpenEstimate={() => setIsQuotationModalOpen(true)}
          />
        )}

        {activeTab === 'select-photographers' && (
          <PhotographersPage
            selectedCreators={selectedCreators}
            setSelectedCreators={setSelectedCreators}
            onViewProfile={(p) => setSelectedPhotographerForProfile(p)}
            onRequestPhotographer={handleOpenBookNow}
            onOpenMultiBooking={() => setIsMultiBookingModalOpen(true)}
            onNavigate={navigateTo}
            setActiveLightboxImg={setActiveLightboxImg}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            onAddNew={() => setIsQuotationModalOpen(true)}
            onOpenLogin={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
            onOpenRegister={() => { setAuthMode('register'); setIsAuthModalOpen(true); }}
            onViewProfile={(p) => setSelectedPhotographerForProfile(p)}
            onNavigate={navigateTo}
          />
        )}

        {activeTab === 'about' && (
          <AboutPage onNavigate={navigateTo} />
        )}

        {activeTab === 'contact' && (
          <ContactPage onNavigate={navigateTo} />
        )}
      </main>

      {/* Sticky Multi-Photographer Floating Bar */}
      {selectedCreators.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 900,
            background: '#121826',
            border: '1px solid var(--color-gold-warm)',
            boxShadow: '0 15px 40px rgba(0,0,0,0.6)',
            borderRadius: '40px',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            color: '#fff',
            maxWidth: '92vw',
            animation: 'modalScale 0.3s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', marginLeft: '-6px' }}>
              {selectedCreators.slice(0, 4).map((c) => (
                <img
                  key={c.id}
                  src={c.avatar}
                  alt={c.name}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    border: '2px solid #121826',
                    marginLeft: '-8px',
                    objectFit: 'cover'
                  }}
                />
              ))}
            </div>
            <div>
              <span style={{ fontWeight: '700', fontSize: '14px', color: '#fff' }}>
                {selectedCreators.length} Photographer{selectedCreators.length === 1 ? '' : 's'} Selected
              </span>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-gold-warm)' }}>
                Est: ₹{selectedCreators.reduce((sum, c) => sum + (c.startingPrice || 0), 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => setSelectedCreators([])}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}
            >
              Clear
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setIsMultiBookingModalOpen(true)}
              style={{ padding: '8px 20px', fontSize: '12px', borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Book Selected</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <QuotationModal
        isOpen={isQuotationModalOpen}
        onClose={() => setIsQuotationModalOpen(false)}
        onNavigate={navigateTo}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        selectedPhotographer={selectedPhotographerForBooking}
        initialEventType={bookingEvent}
        initialServiceType={bookingService}
        onNavigate={navigateTo}
      />

      <MultiBookingModal
        isOpen={isMultiBookingModalOpen}
        onClose={() => setIsMultiBookingModalOpen(false)}
        selectedCreators={selectedCreators}
        onClearSelection={() => setSelectedCreators([])}
        onNavigate={navigateTo}
      />

      <PhotographerProfileModal
        photographer={selectedPhotographerForProfile}
        isOpen={!!selectedPhotographerForProfile}
        onClose={() => setSelectedPhotographerForProfile(null)}
        onBookNow={handleOpenBookNow}
        onOpenLightbox={(url, title, author) => setActiveLightboxImg({ url, title, author })}
      />

      <LightboxModal
        isOpen={!!activeLightboxImg}
        image={activeLightboxImg?.url}
        title={activeLightboxImg?.title}
        author={activeLightboxImg?.author}
        onClose={() => setActiveLightboxImg(null)}
        onBookStyle={() => handleOpenBookNow('Wedding', 'Photo + Video')}
      />

      <CreatorAuthModal
        isOpen={isAuthModalOpen}
        initialMode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
        onNavigate={navigateTo}
      />

      {/* Footer */}
      <Footer
        onNavigate={navigateTo}
        onOpenRegister={() => { setAuthMode('register'); setIsAuthModalOpen(true); }}
      />

    </div>
  );
};
