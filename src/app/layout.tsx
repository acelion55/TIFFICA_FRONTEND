import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
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

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tiffica - Best Tiffin Service in Jaipur | Home Cooked Meals Delivered",
  description: "Order the best affordable tiffin service in Jaipur. Fresh, homemade meals delivered daily. Healthy, hygienic, and delicious tiffin delivery at your doorstep.",
  keywords: "best tiffin service in jaipur, best affordable tiffin in jaipur, order best tiffin in jaipur, tiffin delivery jaipur, home cooked meals jaipur, healthy tiffin service, daily tiffin jaipur, meal delivery jaipur",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tiffica - Best Tiffin Service Jaipur',
  },
  verification: {
    google: 'M3G7DutCabpv_Z7J0SU969bNVe3zw2tOuTuw-0UH9gM',
  },
  openGraph: {
    title: 'Tiffica - Best Tiffin Service in Jaipur',
    description: 'Order the best affordable tiffin service in Jaipur. Fresh, homemade meals delivered daily.',
    url: 'https://tiffica.vercel.app',
    siteName: 'Tiffica',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tiffica - Best Tiffin Service in Jaipur',
    description: 'Order the best affordable tiffin service in Jaipur. Fresh, homemade meals delivered daily.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
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
    url: 'https://tiffica.vercel.app',
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
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
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
