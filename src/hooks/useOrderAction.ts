import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useOrderAction() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Detect if mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      return mobileRegex.test(userAgent.toLowerCase());
    };

    setIsMobile(checkMobile());

    // Check if native app is installed (NOT PWA)
    // PWA runs in browser, so we only check for native app via custom scheme
    const checkNativeApp = () => {
      if ((window as any).tiffcaApp) {
        return true;
      }
      return false;
    };

    setIsNativeApp(checkNativeApp());
  }, []);

  const handleOrderClick = () => {
    if (isMobile === null) return;

    if (isMobile) {
      // Mobile: check if NATIVE app is installed (NOT PWA)
      if (isNativeApp) {
        // Native app is installed, open it
        window.location.href = 'tiffica://order';
        // Fallback after 1 second if custom scheme doesn't work
        setTimeout(() => {
          router.push('/signup');
        }, 1000);
      } else {
        // Native app not installed, go to signup (PWA will handle it)
        router.push('/signup');
      }
    } else {
      // Desktop: show modal
      setShowModal(true);
    }
  };

  const handleDownloadApp = () => {
    // Trigger download - you can customize this based on your backend
    // For now, just close the modal
    setShowModal(false);
  };

  return {
    isMobile,
    isNativeApp,
    showModal,
    setShowModal,
    handleOrderClick,
    handleDownloadApp,
  };
}
