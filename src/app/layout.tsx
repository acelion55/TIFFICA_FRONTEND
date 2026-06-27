import type { Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LocationProvider } from "@/context/LocationContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { DeliveryAuthProvider } from "@/context/DeliveryAuthContext";
import LocationModal from "@/components/location-modal";
import CouponPopup from "@/components/CouponPopup";
import RoleRedirect from "@/components/role-redirect";
import CapacitorInit from "@/components/capacitor-init";
import Navbar from "@/components/navbar";
import CartBar from "@/components/CartBar";
import WalletBar from "@/components/wallet-bar";
import { AppUpdateNotification } from "@/components/AppUpdateNotification";
import ActivityTracker from "@/components/ActivityTracker";
import PushSoundPlayer from '@/components/PushSoundPlayer';

export const viewport: Viewport = {
  themeColor: '#f97316',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.jpeg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/logo.jpeg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tiffica" />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body className="font-sans">
        <CapacitorInit />
        <AppUpdateNotification />
        <ToastProvider>
          <AuthProvider>
            <DeliveryAuthProvider>
              <NotificationProvider>
                <CartProvider>
                  <PushSoundPlayer />
                  <LocationProvider>
                    <RoleRedirect />
                    <ActivityTracker />
                    <WalletBar />
                    {children}
                    <CartBar />
                    <Navbar />
                    <LocationModal />
                    <CouponPopup />
                  </LocationProvider>
                </CartProvider>
              </NotificationProvider>
            </DeliveryAuthProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
