import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LocationProvider } from "@/context/LocationContext";
import LocationModal from "@/components/location-modal";
import AppShell from "@/components/app-shell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tiffica - Meal Delivery",
  description: "Fresh tiffin meals delivered to your door",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LocationProvider>
            <AppShell>{children}</AppShell>
            <LocationModal />
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
