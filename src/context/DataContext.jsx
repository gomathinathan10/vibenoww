import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [photographers, setPhotographers] = useState([]);
  const [works, setWorks] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vibenoww_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Synchronize with production backend on mount
  useEffect(() => {
    const fetchFreshData = async () => {
      try {
        const orderRes = await fetch('/api/orders');
        if (orderRes.ok) {
          const json = await orderRes.json();
          if (json.success && Array.isArray(json.data)) {
            setWorks(json.data);
          }
        }
      } catch (e) {
        // Fallback to local memory
      }

      try {
        const photogRes = await fetch('/api/photographers');
        if (photogRes.ok) {
          const json = await photogRes.json();
          if (json.success && Array.isArray(json.data)) {
            setPhotographers(json.data);
          }
        }
      } catch (e) {
        // Fallback to local memory
      }
    };

    fetchFreshData();
  }, []);

  // Persist logged-in session
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('vibenoww_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('vibenoww_current_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  const publicApprovedPhotographers = photographers.filter(p => p.status === 'APPROVED' || p.approvalStatus === 'APPROVED');

  const createOrder = async (orderData) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: orderData.clientName || orderData.customerName,
          customerPhone: orderData.clientPhone || orderData.customerPhone,
          customerEmail: orderData.clientEmail || orderData.customerEmail,
          shootType: orderData.eventType || orderData.shootType || 'Wedding',
          shootDate: orderData.eventDate || orderData.shootDate || new Date().toISOString().split('T')[0],
          location: orderData.location || 'Tamil Nadu',
          requirements: Array.isArray(orderData.requiredServices) ? orderData.requiredServices.join(', ') : (orderData.requirements || ''),
          estimatedBudget: orderData.estimatedBudget || orderData.quotation?.finalAmount || 0,
          assignedPhotographerId: orderData.assignedPhotographerId || null,
          customerNotes: orderData.notes || orderData.customerNotes || ''
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        const created = json.data;
        setWorks(prev => [created, ...prev.filter(w => w.id !== created.id)]);
        return created;
      }
    } catch (err) {
      console.warn('API save order notice:', err.message);
    }

    // Local state fallback
    const local = {
      id: `w-${Date.now().toString().slice(-4)}`,
      workCode: `VN-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'NEW',
      ...orderData
    };
    setWorks(prev => [local, ...prev]);
    return local;
  };

  const createWork = (workData) => {
    return createOrder(workData);
  };

  const updateWorkStatus = async (workId, status, notes = '') => {
    setWorks(prev => prev.map(w => {
      if (w.id === workId) {
        return {
          ...w,
          status,
          updatedAt: new Date().toISOString().split('T')[0],
          statusNotes: notes || w.statusNotes
        };
      }
      return w;
    }));

    try {
      await fetch(`/api/orders/${workId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
    } catch (e) {}
  };

  const submitWorkQuotation = async (workId, quotationData) => {
    setWorks(prev => prev.map(w => {
      if (w.id === workId) {
        return {
          ...w,
          quotation: quotationData,
          status: 'QUOTED',
          quotedAt: new Date().toISOString().split('T')[0]
        };
      }
      return w;
    }));

    try {
      await fetch(`/api/orders/${workId}/quotation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotationData)
      });
    } catch (e) {}
  };

  const acceptWorkQuotation = (workId) => {
    updateWorkStatus(workId, 'CONFIRMED', 'Client accepted quotation & booking secured.');
  };

  const checkPhotographerAvailability = (photographerId, date) => {
    const photographer = photographers.find(p => p.id === photographerId);
    if (!photographer) return { isAvailable: false, reason: 'Photographer not found' };
    if (photographer.status !== 'APPROVED') return { isAvailable: false, reason: 'Profile not verified' };
    const booked = photographer.bookedDates || [];
    if (booked.includes(date)) {
      return { isAvailable: false, reason: 'Date already booked' };
    }
    return { isAvailable: true };
  };

  const registerCreator = async (creatorData) => {
    try {
      const res = await fetch('/api/photographers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creatorData)
      });
      const json = await res.json();
      if (json.success && json.data) {
        setPhotographers(prev => [json.data, ...prev]);
        setCurrentUser(json.data);
        return json.data;
      }
    } catch (e) {}

    const newCreator = {
      id: `c${photographers.length + 1}`,
      status: 'APPROVED',
      rating: 5.0,
      reviewCount: 0,
      verified: true,
      featured: false,
      avatar: creatorData.avatar || '/images/vibenoww-logo.png',
      coverImage: '/images/vibenow-hero-bg.jpg',
      portfolio: [],
      packages: [
        { name: 'Standard Package', price: Number(creatorData.startingPrice) || 15000, features: ['Full Day Coverage', 'High-Res Edited Photos', 'Online Gallery'] }
      ],
      ...creatorData
    };
    setPhotographers(prev => [newCreator, ...prev]);
    setCurrentUser(newCreator);
    return newCreator;
  };

  const loginUser = async (identifier, password) => {
    const raw = (identifier || '').toLowerCase().trim();

    // Check with API
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: raw, password })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        return { success: true, user: data.user };
      }
    } catch (e) {}

    // Check local photographers list
    const cleanPhone = raw.replace(/[^0-9]/g, '');
    const found = photographers.find(p => {
      const pPhone = (p.phone || '').replace(/[^0-9]/g, '');
      const pMobile = (p.mobile || '').replace(/[^0-9]/g, '');
      const phoneMatch = cleanPhone && cleanPhone.length >= 5 && (
        pPhone === cleanPhone || pMobile === cleanPhone
      );
      const nameOrUserMatch = (p.username && p.username.toLowerCase() === raw) ||
        (p.name && p.name.toLowerCase() === raw) ||
        (p.email && p.email.toLowerCase() === raw) ||
        (p.id && p.id.toLowerCase() === raw);
      const passMatch = p.password === password;
      return (phoneMatch || nameOrUserMatch) && passMatch;
    });

    if (found) {
      setCurrentUser(found);
      return { success: true, user: found };
    }

    return { success: false, message: 'Invalid credentials. Please verify your mobile number and password.' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <DataContext.Provider value={{
      photographers,
      setPhotographers,
      publicApprovedPhotographers,
      works,
      setWorks,
      createWork,
      createOrder,
      updateWorkStatus,
      submitWorkQuotation,
      acceptWorkQuotation,
      checkPhotographerAvailability,
      currentUser,
      registerCreator,
      loginUser,
      logout
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
