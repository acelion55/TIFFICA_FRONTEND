'use client';

import Script from 'next/script';
import { useCallback, useEffect, useRef } from 'react';

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccounts {
  id: {
    initialize: (options: {
      client_id: string;
      callback: (response: GoogleCredentialResponse) => void;
    }) => void;
    renderButton: (
      element: HTMLElement,
      options: {
        type: 'standard';
        theme: 'outline';
        size: 'large';
        text: 'continue_with';
        shape: 'pill';
        width: number;
      }
    ) => void;
  };
}

declare global {
  interface Window {
    google?: {
      accounts: GoogleAccounts;
    };
  }
}

interface GoogleSignInButtonProps {
  disabled?: boolean;
  onCredential: (credential: string) => void;
  onUnavailable: () => void;
}

export default function GoogleSignInButton({
  disabled = false,
  onCredential,
  onUnavailable,
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const credentialHandlerRef = useRef(onCredential);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    credentialHandlerRef.current = onCredential;
  }, [onCredential]);

  const renderGoogleButton = useCallback(() => {
    if (!clientId || !buttonRef.current || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: response => credentialHandlerRef.current(response.credential),
    });

    buttonRef.current.replaceChildren();
    window.google.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'pill',
      width: Math.min(buttonRef.current.clientWidth, 360),
    });
  }, [clientId]);

  useEffect(() => {
    renderGoogleButton();
  }, [renderGoogleButton]);

  if (!clientId) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onUnavailable}
        className="w-full h-12 rounded-full bg-white text-gray-800 font-semibold flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <GoogleLogo />
        Continue with Google
      </button>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={renderGoogleButton}
      />
      <div
        className={`w-full min-h-12 flex justify-center ${disabled ? 'pointer-events-none opacity-50' : ''}`}
        ref={buttonRef}
      />
    </>
  );
}

function GoogleLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.64-2.36l-3.24-2.54c-.9.6-2.05.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.93A6.02 6.02 0 0 1 6.07 12c0-.67.12-1.32.32-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.55l3.35-2.62Z" />
      <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z" />
    </svg>
  );
}
