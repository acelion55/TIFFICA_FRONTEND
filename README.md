<div align="center">

<!-- Animated Banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24&height=200&section=header&text=TIFFICA%20Frontend&fontSize=55&fontColor=fff&animation=twinkling&fontAlignY=35&desc=🍱%20Progressive%20Web%20App%20•%20Next.js%2015%20•%20React%2019%20•%20TypeScript&descAlignY=55&descSize=16" width="100%"/>

<!-- Badges -->
<p>
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white"/>
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white"/>
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white"/>
</p>

<p>
  <img src="https://img.shields.io/badge/status-active-brightgreen?style=flat-square"/>
  <img src="https://img.shields.io/badge/version-0.1.0-blue?style=flat-square"/>
  <img src="https://img.shields.io/badge/PWA-installable-purple?style=flat-square"/>
</p>

</div>

---

## 🌟 What is TIFFICA?

> **TIFFICA** is a startup tiffin (home-style meal) delivery platform. This is the **frontend PWA** — a fully installable, mobile-first web app built with Next.js 15 and React 19. Customers can browse menus, place orders, subscribe to meal plans, schedule deliveries, and pay — all from their phone like a native app.

---

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| 🖥️ Framework | Next.js 15 (App Router) |
| ⚛️ UI Library | React 19 |
| 🔷 Language | TypeScript |
| 🎨 Styling | Tailwind CSS v4 |
| 🎞️ Animations | Framer Motion |
| 📱 PWA | Service Worker + Web Manifest |
| 🔔 Push Notifications | Web Push API (VAPID) |
| 💳 Payments | Razorpay SDK |
| 🗓️ Date Picker | react-day-picker |
| 🔣 Icons | Lucide React |

---

## 🗂️ Project Structure

```
tifica_web_frontend/
│
├── public/
│   ├── manifest.json          # 📱 PWA manifest (name, icons, theme)
│   ├── sw.js                  # ⚙️  Service Worker (offline + push)
│   ├── icon-192.svg           # PWA icon 192x192
│   └── icon-512.svg           # PWA icon 512x512
│
├── src/
│   │
│   ├── app/                   # 📁 Next.js App Router pages
│   │   ├── layout.tsx         # Root layout — fonts, providers, shell
│   │   ├── page.tsx           # / → redirect to /home or /onboarding
│   │   │
│   │   ├── onboarding/        # 🎉 First-time user welcome screen
│   │   ├── login/             # 🔐 Login page
│   │   ├── signup/            # 📝 Registration page
│   │   ├── forgot-password/   # 🔑 Password reset
│   │   │
│   │   ├── home/              # 🏠 Home feed — banners, featured meals
│   │   ├── menu/              # 🍱 Full menu listing + filters
│   │   ├── search/            # 🔍 Search meals
│   │   │
│   │   ├── checkout/          # 🛒 Cart review + Razorpay payment
│   │   ├── orders/            # 📦 Order history & tracking
│   │   ├── reorder/           # 🔄 Quick reorder from past orders
│   │   │
│   │   ├── subscriptions/     # 📅 Meal subscription plans
│   │   ├── subscribe/         # ➕ Subscribe to a plan
│   │   ├── plan/              # 📋 Plan details
│   │   │
│   │   ├── schedule/          # 🗓️ Schedule meal deliveries
│   │   │   └── menu/          # Schedule-specific menu picker
│   │   │
│   │   ├── addresses/         # 📍 Manage delivery addresses
│   │   ├── profile/           # 👤 User profile & settings
│   │   ├── admin/             # 👑 Admin dashboard
│   │   │
│   │   └── api/               # 🔌 Next.js API routes (proxy layer)
│   │       ├── addresses/
│   │       ├── menu-items/
│   │       ├── past-orders/
│   │       ├── profile/
│   │       └── subscriptions/
│   │
│   ├── components/            # 🧩 Reusable UI components
│   │   ├── app-shell.tsx      # App wrapper — layout, nav, bottom bar
│   │   ├── navbar.tsx         # Top navigation bar
│   │   ├── wallet-bar.tsx     # Wallet balance display bar
│   │   ├── location-modal.tsx # Location picker modal
│   │   ├── address-selector.tsx    # Address selection UI
│   │   ├── meal-items-selector.tsx # Meal item picker
│   │   └── profile-flyout.tsx      # Profile slide-out panel
│   │
│   ├── context/               # 🌐 React Context providers
│   │   ├── AuthContext.tsx    # User auth state + JWT
│   │   ├── CartContext.tsx    # Cart items + totals
│   │   ├── LocationContext.tsx # User location state
│   │   └── ToastContext.tsx   # Global toast notifications
│   │
│   ├── hooks/                 # 🪝 Custom React hooks
│   │   ├── usePWAInstall.ts   # PWA install prompt handler
│   │   ├── usePushNotifications.ts # Web Push subscription
│   │   └── useRazorpay.ts     # Razorpay payment hook
│   │
│   └── lib/                   # 🛠️ Utility functions
│
├── .env.local                 # 🔒 Environment variables (gitignored)
├── next.config.ts             # Next.js config
├── tailwind.config.ts         # Tailwind config
├── tsconfig.json              # TypeScript config
└── package.json
```

---

## 📱 PWA Features

| Feature | Status |
|---------|--------|
| 📲 Installable on mobile/desktop | ✅ |
| 🔔 Push notifications | ✅ |
| ⚙️ Service Worker | ✅ |
| 📶 Offline support | ✅ |
| 🎨 Custom app icons | ✅ |
| 🌈 Splash screen | ✅ |

---

## 🔄 How It Works

```
┌──────────────────────────────────────────────────────────┐
│                    USER OPENS APP                        │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│              Next.js App Router (layout.tsx)             │
│   AuthContext → CartContext → LocationContext → Toast    │
└──────┬───────────────────────────────────────┬───────────┘
       │                                       │
       ▼                                       ▼
┌─────────────┐                    ┌───────────────────────┐
│  Onboarding │                    │      App Shell        │
│  (new user) │                    │  Navbar + Bottom Nav  │
└─────────────┘                    └──────────┬────────────┘
                                              │
              ┌───────────────────────────────┼──────────────────────┐
              ▼                               ▼                      ▼
     ┌──────────────┐              ┌─────────────────┐    ┌──────────────────┐
     │  Home Feed   │              │   Menu / Search  │    │  Subscriptions   │
     │  (banners,   │              │   (browse meals, │    │  (meal plans,    │
     │   featured)  │              │    add to cart)  │    │   scheduling)    │
     └──────────────┘              └────────┬────────┘    └──────────────────┘
                                            │
                                            ▼
                                  ┌──────────────────┐
                                  │    Checkout       │
                                  │  Razorpay Payment │
                                  └────────┬─────────┘
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │  Order Confirmed  │
                                  │  Push Notification│
                                  └──────────────────┘
```

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd tifica_web_frontend
npm install
```

### 2. Setup Environment

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<your_vapid_public_key>
```

### 3. Run

```bash
# Development
npm run dev
# → http://localhost:3000

# Production build
npm run build
npm start
```

---

## 🔐 Auth Flow

```
User → Login page → POST /api/auth/login (backend)
     ← JWT token stored in AuthContext + localStorage

Protected pages check AuthContext → redirect to /login if no token
```

---

## 🛒 Cart & Checkout Flow

```
Menu page → Add items → CartContext (global state)
         → Checkout page → Address selection
         → Razorpay payment modal (useRazorpay hook)
         → Payment verified by backend
         → Order created → Push notification sent
```

---

## 📅 Subscription Flow

```
/subscriptions → Browse plans
/subscribe     → Select plan + schedule
/schedule      → Pick delivery days + meal preferences
/plan          → View active plan details
```

---

## 🌍 Deployment

```bash
# Vercel (recommended)
vercel deploy

# Self-hosted
npm run build
npm start
```

Set environment variables in your hosting dashboard.

---

## 🔗 Backend

This frontend connects to the **TIFFICA Backend API**.
See [`tifica_web_backend-/README.md`](../tifica_web_backend-/README.md) for backend setup.

---

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24&height=100&section=footer&animation=twinkling" width="100%"/>

**Built with ❤️ for TIFFICA — Startup Meal Delivery Platform**

</div>
