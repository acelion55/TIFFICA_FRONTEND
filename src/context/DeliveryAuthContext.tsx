'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface DeliveryPartner {
  _id: string;
  name: string;
  phone: string;
  profilePhoto?: string;
  isVerified: boolean;
  isOnline: boolean;
  vehicleType: string;
  rating: number;
  totalDeliveries: number;
  walletBalance: number;
}

interface DeliveryAuthContextType {
  partner: DeliveryPartner | null;
  token: string | null;
  loading: boolean;
  login: (phone: string, otp: string, name?: string) => Promise<any>;
  sendOTP: (phone: string) => Promise<any>;
  logout: () => void;
  updatePartner: (data: Partial<DeliveryPartner>) => void;
  toggleOnline: () => Promise<void>;
}

const DeliveryAuthContext = createContext<DeliveryAuthContextType | undefined>(undefined);

export function DeliveryAuthProvider({ children }: { children: ReactNode }) {
  const { user, token, loading: authLoading } = useAuth();
  const [partner, setPartner] = useState<DeliveryPartner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Convert user to partner if role is delivery
    if (user && user.role === 'delivery') {
      setPartner({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        profilePhoto: undefined,
        isVerified: true,
        isOnline: false,
        vehicleType: 'bike',
        rating: 5.0,
        totalDeliveries: 0,
        walletBalance: user.walletBalance || 0
      });
    } else {
      setPartner(null);
    }
    setLoading(authLoading);
  }, [user, authLoading]);

  const sendOTP = async (phone: string) => {
    return { success: false, error: 'Use main login page' };
  };

  const login = async (phone: string, otp: string, name?: string) => {
    return { success: false, error: 'Use main login page' };
  };

  const logout = () => {
    setPartner(null);
  };

  const updatePartner = (data: Partial<DeliveryPartner>) => {
    if (partner) {
      setPartner({ ...partner, ...data });
    }
  };

  const toggleOnline = async () => {
    if (partner) {
      updatePartner({ isOnline: !partner.isOnline });
    }
  };

  return (
    <DeliveryAuthContext.Provider value={{ partner, token, loading, login, sendOTP, logout, updatePartner, toggleOnline }}>
      {children}
    </DeliveryAuthContext.Provider>
  );
}

export function useDeliveryAuth() {
  const context = useContext(DeliveryAuthContext);
  if (!context) {
    return {
      partner: null,
      token: null,
      loading: false,
      login: async () => ({ success: false, error: 'Provider not found' }),
      sendOTP: async () => ({ success: false, error: 'Provider not found' }),
      logout: () => {},
      updatePartner: () => {},
      toggleOnline: async () => {}
    };
  }
  return context;
}
