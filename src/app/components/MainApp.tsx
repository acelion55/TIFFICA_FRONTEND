"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, Calendar, RefreshCw, Star, User } from "lucide-react";

export default function MainApp({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(pathname);

  const handleTabClick = (path: string) => {
    setActiveTab(path);
    router.push(path);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-grow overflow-y-auto">{children}</div>
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
        <div className="flex justify-around py-2">
          <Tab
            icon={<Home />}
            label="Home"
            path="/home"
            activeTab={activeTab}
            onClick={handleTabClick}
          />
          <Tab
            icon={<Calendar />}
            label="Plan"
            path="/plan"
            activeTab={activeTab}
            onClick={handleTabClick}
          />
          <Tab
            icon={<RefreshCw />}
            label="Reorder"
            path="/orders"
            activeTab={activeTab}
            onClick={handleTabClick}
          />
          <Tab
            icon={<Star />}
            label="Subscribe"
            path="/subscribe"
            activeTab={activeTab}
            onClick={handleTabClick}
          />
          <Tab
            icon={<User />}
            label="Profile"
            path="/profile"
            activeTab={activeTab}
            onClick={handleTabClick}
          />
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
