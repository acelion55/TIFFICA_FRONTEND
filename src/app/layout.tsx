import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LocationProvider } from "@/context/LocationContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import LocationModal from "@/components/location-modal";
import AppShell from "@/components/app-shell";
import CouponPopup from "@/components/CouponPopup";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tiffica - Meal Delivery",
  description: "Fresh tiffin meals delivered to your door",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tiffica',
  },
};

export const viewport: Viewport = {
  themeColor: '#f97316',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body className={inter.className}>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <LocationProvider>
                <AppShell>{children}</AppShell>
                <LocationModal />
                <CouponPopup />
              </LocationProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
