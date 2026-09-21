# Digital Heroes — Play, Win, and Give Back

A golf performance tracking, monthly reward draws, and charity fundraising platform built with React, TypeScript, Tailwind CSS, Framer Motion, and Supabase.

---

## 📖 Project Overview

**Digital Heroes** bridges amateur golf performance with philanthropic impact. Members log verified Stableford scores from their rounds, which are translated into entries for a monthly cash prize draw. A guaranteed percentage of all subscriptions and donations directly supports verified charity partners under the UK Charity Commission Framework.

---

## 🚀 Key Features

### 1. 🏌️‍♂️ Stableford Scorecard Logging & Handicap Tracking
* Immediate real-time validation: points must be an integer between **1 and 45**.
* Date selection with duplicate-date prevention.
* Automatic rolling limit of **5 latest scores** enforced via database trigger (`enforce_max_five_scores`).
* Live scorecard history with edit and delete capabilities.

### 2. 🎗️ Cause & Charity Ecosystem
* Comprehensive directory of verified charities (Clean Water Initiative, GiveGreen Foundation, UK Sports Trust Alliance, etc.).
* Guaranteed **10% allocation** included in member subscriptions.
* Independent direct donation portal (100% direct giving separate from draw participation).

### 3. 💳 Membership & Subscriptions (with Demo Payment Mode)
* **Monthly Supporter (£9.99/mo)**: 1 Draw entry slot, handicap tracking, 10% charity contribution.
* **Annual Hero (£99.99/yr)**: 2x Draw entries, priority verification, save 17%.
* Full Stripe checkout architecture with an interactive **Demo Checkout Mode** (`Activate Demo Subscription`) for local evaluation and testing without live payment gateway blockers.

### 4. 🎱 Structured Prize Pool Draw Engine
* Monthly pool allocation: Match 5 Jackpot (40%), Match 4 (35%), Match 3 (25%), and Charity Pot.
* Certified Random Draw & Algorithmic Random Protocol modes.
* Live countdown timer and historical draw results archive.

### 5. 🛡️ Winner Verification Portal
* 3-step verification flow:
  1. **01 Identity Verification**: UK/SGB compliance clearance check.
  2. **02 Stableford Scorecard Proof**: Drag & drop photo/digital scorecard upload (PNG, JPG, PDF up to 10MB) to secure Supabase storage.
  3. **03 Payment Processing**: UK Bank Transfer (Sort Code + Account Number) or International Wire details with transfer schedule tracking.

### 6. 👑 Secure Admin Console
* Dedicated dark luxury console (`/admin`).
* 5 Platform KPIs with MoM trend tracking.
* Player Handicaps & Audit Logs with search and verification actions.
* Interactive **March Draw Simulation Block** (`Run Simulated Payout Model`).
* Registered Causes Allocations ledger.

---

## 🛠️ Tech Stack

* **Frontend**: React 18, TypeScript, Vite
* **Styling & UI**: Tailwind CSS, Lucide React, Framer Motion
* **Backend / Database**: Supabase (PostgreSQL, Row Level Security, Storage Buckets, Database Triggers & RPC functions)
* **Auth**: Supabase Auth (JWT session management with role-based access control)

---

## 📦 Project Structure

```
digital-heroes/
├── src/
│   ├── components/       # Reusable UI components, ProtectedRoute, AnimatedRoutes
│   ├── contexts/         # AuthContext & Session management
│   ├── layouts/          # Navbar (with dynamic active tab highlighting) & Footer
│   ├── pages/            # Home, Login, Signup, Subscription, Charities, CharityDetail,
│   │                     # Dashboard, Scores, Draws, WinnerVerification, AdminDashboard
│   ├── services/         # authService, scoreService, charityService, drawService, winnerService
│   ├── types/            # TypeScript data contracts and schemas
│   └── lib/              # Supabase client and utility helpers
├── supabase/
│   └── migrations/       # Complete SQL migrations (schema, RLS, triggers, RPC)
├── public/               # Static assets and icons
├── package.json
└── README.md
```

---

## ⚙️ Setup & Local Development

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd digital-heroes
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### 3. Database Migration
Apply all database migrations to your Supabase instance:
```bash
npx supabase db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing & Demo Credentials

### Pre-Configured Test User Accounts:
* **Demo Member Account**:
  * Email: `testuser@digitalheroes.test` or `sahunishant189@gmail.com`
* **Demo Admin Account**:
  * Role: `admin` in `public.profiles`
  * Direct URL: [http://localhost:5173/admin](http://localhost:5173/admin)

### Demo Mode Verification Steps:
1. Navigate to `/subscribe` and click **"Get Started Monthly"** or **"Get Started Annually"**.
2. Click **"Activate Demo Subscription"** in the modal.
3. Your account instantly becomes an active subscriber.
4. Visit `/scores` to submit up to 5 Stableford scores (points 1–45).
5. Visit `/draws` to see live pool allocations and winning numbers.
6. Visit `/winner-verification` to test the 3-step proof upload and payout scheduling.
7. Visit `/admin` to simulate payout models and audit player handicaps.

---

## 📄 License & Compliance

Licensed under the UK Charity Commission Framework standard.
