# App Architecture and User Workflow

## App Launch
*   **_layout.jsx (AuthProvider + WalletProvider + CartProvider + ScheduleCartProvider)**
    *   **RootNavigation**
        *   `[No token]` → Guest Stack
            *   Login (newsignup.jsx used as login screen)
            *   Signup (newsignup.jsx)
            *   ForgotPassword (3-step: Email → OTP → Reset)
            *   LegalPage (terms / privacy)
        *   `[token + admin email]` → Admin Stack
            *   (see Admin section below)
        *   `[token + regular user]` → User Stack
            *   (see User Flow section below)

## Login Screen
*   Password login → `authAPI.loginWithPassword()`
*   OTP login → `authAPI.sendOtp()` → `authAPI.loginWithOtp()`
*   Google login → `authAPI.loginWithGoogle()`
*   → Signup Screen
    *   Register → `authAPI.register()`
    *   Welcome Modal (success)
    *   LocationModal → navigate to MainApp
*   → ForgotPassword
    *   Step 1: Enter email → `POST /auth/forgot-password`
    *   Step 2: Enter OTP → `POST /auth/verify-reset-otp`
    *   Step 3: New password → `POST /auth/reset-password` → back to Login

## User Flow
**Bottom Tab Navigator (MainTabs)**

| Tab | Screen | Key Features |
| :--- | :--- | :--- |
| Home | `newhome.jsx` | Video banner, Today's Special, Best Sellers, Category filter, Profile panel |
| Plan | `schedule.jsx` | Calendar, Breakfast/Lunch/Dinner booking, Lock/Unlock meals, Wallet deduction |
| Orders | `reorder.jsx`| Order history, filter by status, Reorder delivered orders |
| Subscribe | `subscription.jsx` | View/buy plans via Razorpay WebView, wallet top-up on success |

## MainApp (Tabs)
*   `addresspage.jsx`
    *   GPS location fetch (expo-location)
    *   Add address (type: Home/Work/Other)
    *   Set default address
    *   Delete address
*   SearchScreen (`search.jsx`)
    *   Auto-fetch all menu items on load
    *   Debounced search (500ms) → `GET /menu/search/:query`
    *   Add to cart via CartContext
*   MealDetail (`mealdetail.jsx`)
    *   Category filter: dal / sabji / raita / roti
    *   Add to cart
*   Checkout (`components/cart/checkout.jsx`)
    *   Cart items + quantities
    *   Address selection
    *   Place order → `POST /orders`
*   OrderSuccess (`order/success.jsx`)
    *   Shows Order ID, Amount, Distance, Status
    *   Navigate to Orders or Home
*   HelpSupport (`help/help_support.jsx`)
    *   Call support (tel: link)
    *   Submit complaint → `POST /complaints`
*   LegalPage (`legal/LegalPage.jsx`)
    *   Fetch terms/privacy from `GET /legalpages/:pageType`

## Profile Panel (Slide-in modal)
*   View / Edit name & phone → `PUT /auth/profile`
*   Logout
*   Manage Addresses → `addresspage`
*   Help & Support → HelpSupport
*   Terms & Conditions → LegalPage (terms)
*   Privacy Policy → LegalPage (privacy)

## Schedule Screen
*   Calendar (`react-native-calendars`)
    *   Select date (past = read-only, today/future = bookable)
*   For each meal type (Breakfast / Lunch / Dinner):
    *   Browse Items → MealItemsSelector modal
        *   `addToMealCart(date, mealType, item)` → ScheduleCartContext
    *   Adjust quantities inline (+ / − / 🗑)
    *   Select Address → Address modal
    *   Lock 🔒
        *   Check wallet balance ≥ cart total
        *   `POST /subscription-orders/lock`
        *   `removeFromWallet(amount)` → WalletContext
        *   Locked meal shown with items + amount
*   Unlock 🔓
    *   `DELETE /subscription-orders/:id`
    *   `addToWallet(refundAmount)` → WalletContext

## Subscribe Screen
*   Load plans → `GET /subscriptions/plans`
*   Select plan → `POST /payments/create-link` (Razorpay)
*   WebView opens payment URL
*   On success URL → `POST /subscriptions` (activate)
    *   Amount added to wallet
*   My Subscriptions → `GET /subscriptions/my-subscriptions`

## Admin Stack
`email === 'admin@gmail.com'`
*   **AdminDashboard**
    *   Stats: Users, Orders, Menu Items, Cloud Kitchens, Subscriptions
    *   Sales bar chart (configurable days filter)
    *   Management Grid:
        *   ManageUsers → `GET/POST /admin/users`
        *   ManageCloudKitchens → `GET/POST/DELETE /admin/cloudkitchens`
        *   ManageMenu → `GET/POST/PUT/DELETE /admin/menu`
        *   ManageOrders → `GET /admin/orders`, `PATCH` status
        *   ManageSubscriptions → `GET /admin/subscriptions`
        *   ManageStyles → `GET/PUT /pagestyles`
        *   ManageSubscriptionCards → `GET/PUT /subscription-cards`
        *   ManageSubscriptionPlans → `GET/POST/PUT/DELETE /admin/subscription-plans`
        *   ManageComplaints → `GET /complaints`
        *   ManageLegalPages → `GET/PUT /legalpages`

## Global State (Context Providers)
| Context | Scope | Key State |
| :--- | :--- | :--- |
| **AuthContext** | App-wide | `user`, `token`, `loading` — login/register/logout/updateUser |
| **WalletContext** | App-wide | `walletBalance` — synced from `/auth/me`, add/remove/refresh |
| **CartContext** | App-wide | `cart[]` — instant order cart, add/remove/updateQty/clear |
| **ScheduleCartContext** | App-wide | `scheduleCart{}`, `lockedMeals{}`, `mealAddresses{}` — per date+mealType |

## Backend API Routes (`server.js`)
| Route Prefix | File | Purpose |
| :--- | :--- | :--- |
| `/api/auth` | `userauth.js` | Register, login (OTP/password/Google), profile, addresses, wallet |
| `/api/menu` | `menu.js` | Menu items, search, by category/mealtype, today-special |
| `/api/orders` | `orders.js` | Create, get, reorder, cancel |
| `/api/subscriptions` | `subscriptions.js` | Plans, create, my-subscriptions |
| `/api/subscription-orders` | `subscriptionorders.js` | Lock/unlock meals |
| `/api/subscription-cards` | `subscriptioncards_routes.js` | Subscription UI cards |
| `/api/cloudkitchens` | `cloudkitchen.js` | Nearby kitchens (geo), all, by ID |
| `/api/homestyles` | `homestyles.js` | Home screen tagline, videos, categories, bestsellers |
| `/api/pagestyles` | `pagestyles_routes.js` | Admin-configurable page styles |
| `/api/scheduleconfigs` | `scheduleconfigs.js` | Schedule screen title/subtitle/meal types |
| `/api/admin` | `admin_updated.js` | Stats, users, menu, orders, subscriptions, sales |
| `/api/complaints` | `complaints.js` | User complaints |
| `/api/legalpages` | `legalpages.js` | Terms & Privacy content |
| `/api/payments` | `payments.js` | Razorpay payment link creation |
| `/api/upload` | `upload.js` | Image/file uploads |

## Key Components
| Component | Used In | Purpose |
| :--- | :--- | :--- |
| `FloatingCart` | MainTabs | Persistent cart bubble over all tabs |
| `LocationModal` | Home, Signup, Welcome | GPS + nearest cloud kitchen selection |
| `MealDetailsModal` | Home | Quick meal detail + add to cart |
| `MealItemsSelector` | Schedule | Browse & add items to schedule cart |
| `MealCartModal` | Schedule | View schedule cart |
| `WalletDisplay` | Home, Schedule, Orders, Subscribe | Shows wallet balance |
| `SkeletonLoader` | Home, Schedule, Orders | Loading placeholders |
| `AddressHome` | Home header | Shows selected delivery address |
| `bestsellercard` (ui) | Home | Bestseller item cards |
| `daily_special_box` | Home | Category-filtered menu items |
| `bestseller (menucards)`| Search | Search result menu cards |
| `premiumcard (adcards)`| — | Premium subscription ad card |
