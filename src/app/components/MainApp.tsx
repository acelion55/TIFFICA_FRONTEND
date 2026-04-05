"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, Calendar, RefreshCw, Star, User } from "lucide-react";
import CouponPopup from "@/components/CouponPopup";
import { useSwipe } from "@/hooks/useSwipe";

const TABS = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/plan', icon: Calendar, label: 'Plan' },
  { path: '/orders', icon: RefreshCw, label: 'Reorder' },
  { path: '/subscribe', icon: Star, label: 'Subscribe' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function MainApp({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(pathname);

  useEffect(() => {
    setActiveTab(pathname);
  }, [pathname]);

  const handleTabClick = (path: string) => {
    setActiveTab(path);
    router.push(path);
  };

  // Swipe navigation
  const handleSwipeLeft = useCallback(() => {
    const currentIndex = TABS.findIndex(t => t.path === activeTab);
    if (currentIndex < TABS.length - 1) {
      const nextPath = TABS[currentIndex + 1].path;
      handleTabClick(nextPath);
    }
  }, [activeTab]);

  const handleSwipeRight = useCallback(() => {
    const currentIndex = TABS.findIndex(t => t.path === activeTab);
    if (currentIndex > 0) {
      const prevPath = TABS[currentIndex - 1].path;
      handleTabClick(prevPath);
    }
  }, [activeTab]);

  useSwipe({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
  }, 80);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-grow overflow-y-auto">{children}</div>
      <CouponPopup />
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
        <div className="flex justify-around py-2">
          {TABS.map(tab => (
            <Tab
              key={tab.path}
              icon={<tab.icon />}
              label={tab.label}
              path={tab.path}
              activeTab={activeTab}
              onClick={handleTabClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Tab({
  icon,
  label,
  path,
  activeTab,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  path: string;
  activeTab: string;
  onClick: (path: string) => void;
}) {
  const isActive = activeTab === path;
  return (
    <div
      className={`flex flex-col items-center cursor-pointer ${isActive ? "text-orange-500" : "text-gray-500"}`}
      onClick={() => onClick(path)}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </div>
  );
}
