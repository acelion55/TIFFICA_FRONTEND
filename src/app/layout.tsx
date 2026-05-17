import type { Viewport } from "next";
import "./globals.css";
import { DEFAULT_SITE_METADATA, SITE_URL } from "@/lib/seo";
import { AuthProvider } from "@/context/AuthContext";
import { LocationProvider } from "@/context/LocationContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { DeliveryAuthProvider } from "@/context/DeliveryAuthContext";
import LocationModal from "@/components/location-modal";
import AppShell from "@/components/app-shell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CouponPopup from "@/components/CouponPopup";
import RoleRedirect from "@/components/role-redirect";
import PWAUpdater from "@/components/pwa-updater";
import PWAGuard from "@/components/pwa-guard";
import PWAInstallBanner from "@/components/pwa-install-banner";

export const metadata = {
  ...DEFAULT_SITE_METADATA,
  metadataBase: new URL(SITE_URL),
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.jpeg',
    apple: '/logo.jpeg',
    shortcut: '/logo.jpeg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tiffica - Best Tiffin Service Jaipur',
  },
  verification: {
    google: 'M3G7DutCabpv_Z7J0SU969bNVe3zw2tOuTuw-0UH9gM',
  },
};

export const viewport: Viewport = {
  themeColor: '#f97316',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    name: 'Tiffica',
    description: 'Best tiffin service in Jaipur offering fresh, home-cooked meals delivered daily',
    url: SITE_URL,
    telephone: '+91-XXXXXXXXXX',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Jaipur',
      addressRegion: 'Rajasthan',
      addressCountry: 'IN',
    },
    servesCuisine: 'Indian',
    priceRange: '₹₹',
    areaServed: {
      '@type': 'City',
      name: 'Jaipur',
    },
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.jpeg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/logo.jpeg" />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans">
        <ToastProvider>
          <AuthProvider>
            <DeliveryAuthProvider>
              <NotificationProvider>
                <CartProvider>
                  <LocationProvider>
                    <RoleRedirect />
                    <PWAGuard>
                      <SiteHeader />
                      <AppShell>{children}</AppShell>
                      <SiteFooter />
                      <PWAInstallBanner />
                    </PWAGuard>
                    <LocationModal />
                    <CouponPopup />
                    <PWAUpdater />
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
