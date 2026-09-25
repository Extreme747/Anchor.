# ⚓ Anchor (`Anchor.`) — The WhatsApp Follow-Up & Revenue Recovery Machine

> **"Stop watching ₹ crore leads go cold."**  
> High-velocity WhatsApp Business SaaS designed for Indian high-ticket SMBs (Real Estate, Healthcare, D2C, EdTech). Built on a deterministic engine with **Zero AI Hallucinations**, sub-1.4s response speed, and heuristic intent scoring.

---

## ⚡ The Core Problem Anchor Solves

Every month, Indian businesses spend between **₹50,000 and ₹25,00,000** on Meta Ads (Facebook/Instagram Click-to-WhatsApp ads) and Google Ads. However, **60% to 70% of inbound WhatsApp leads leak and die without conversion** due to:
1. **Response Latency:** Average human sales rep responds in **3 to 6 hours**. Customer conversion drops by **391%** after the first 5 minutes.
2. **Meta 24-Hour Policy Cliff:** After 24 hours of customer inactivity, Meta closes the free-form conversation session. Unapproved texts cause official numbers to get permanently banned.
3. **Zero Visibility on Lost Revenue:** Business owners have no dashboard quantifying how much money was lost due to slow follow-ups.

---

## 💎 Anchor's Unfair Advantages vs Competitors (Wati, Interakt, AiSensy, DoubleTick)

- 🎯 **Deterministic Intent Scoring Dial (0–100):** Real-time intent detection based on budget triggers (`Cr`, `Lakh`, `budget`, `price`), timeline urgency (`immediate`, `urgent`, `this weekend`), and action intent (`site visit`, `token`, `cheque`).
- ⚡ **Sub-1.4s Deterministic Auto-Replies:** Keyword, exact match, regex, and off-hours auto-responses with 30s deduplication locks.
- 🕒 **Meta 24-Hour Policy State Machine:** Tracks inbound timestamps down to the second; automatically transitions to Meta-Approved Utility Templates at Hour 23.
- 📢 **CTWA 72-Hour Free Messaging Window Optimizer:** Tracks Click-to-WhatsApp ad referrals and maximizes conversions during Meta's 72-hour zero-cost messaging window.
- 🛡️ **Agent Phone Number Masking:** Auto-masks buyer phone numbers (`+91 98XXX XX210`) for `AGENT` roles to prevent sales reps from stealing customer databases.
- ⏳ **SLA Auto-Escalation:** 7-minute first-response deadline with automatic lead revocation and escalation to Managers.
- 💰 **Zero-Markup Meta Pricing:** 100% direct pass-through on Meta official conversation fees (₹0 Anchor markup vs 15–39% hidden competitor markups).

---

## 🏗️ System Architecture

```
Anchor/
├── src/                          # Frontend Application (React 19 + Tailwind CSS v4 + Vite)
│   ├── api/                      # Typed API Client (auth, leads, messages, simulator)
│   ├── components/               # Design system tokens, SVG icons, Navbar, Modals
│   ├── pages/
│   │   ├── Dashboard.tsx         # Primary application shell & navigation
│   │   ├── Inbox.tsx             # 3-Panel High-Velocity Shared Team Inbox + Live Simulator
│   │   ├── Leads.tsx             # Lead management, tags, CSV import/export
│   │   ├── AutoReply.tsx         # Keyword & regex auto-reply builder
│   │   ├── Drip.tsx              # Adaptive drip sequences & A/B testing suite
│   │   ├── Commerce.tsx          # WhatsApp Flows builder & Razorpay in-chat payments
│   │   ├── Routing.tsx           # Round-robin routing, SLA configuration, agent board
│   │   ├── Analytics.tsx         # Revenue leakage report (₹ at risk) & 8 AM executive briefing
│   │   ├── Integrations.tsx      # Hinglish vernacular engine, 99acres sync, Agency portal
│   │   └── Protocol.tsx          # Meta Cloud API gateway, webhook stream, cost audit
│   ├── index.css                 # Dark minimalist design tokens (#080808, #C8953A)
│   └── router.tsx                # Custom hash router
│
└── server/                       # Backend Application (Node.js + Express + TypeScript + Prisma)
    ├── prisma/
    │   ├── schema.prisma         # 16 Multi-Tenant Tables (Org, User, Lead, Message, etc.)
    │   └── seed.ts               # Database seed script with demo real estate leads
    └── src/
        ├── index.ts              # Express + Socket.io Server Entrypoint (:5000)
        ├── config/               # Rate constants, Meta official pricing card, JWT
        ├── middleware/           # Auth guard, RBAC (Owner/Manager/Agent), Number masking
        ├── routes/               # Webhooks, Simulator, Leads, Messages, Drip, Commerce, SLA
        └── services/             # Intent Scoring, AutoReply, Meta Protocol, Cost, Queue
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v20+ (tested on Node v24)
- **npm**: v10+

### 2. Backend Setup
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run seed     # Seeds demo users, auto-reply rules, and leads
npm run dev      # Starts backend on http://localhost:5000
```

### 3. Frontend Setup
```bash
# In the root workspace directory
npm install
npm run dev      # Starts Vite on http://localhost:8443
```

Open [http://localhost:8443/#/dashboard](http://localhost:8443/#/dashboard) in your browser.

---

## 🔑 Demo Login Credentials (Seeded into DB)

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Owner** | `arjun@anchor.io` | `anchor123` | Full admin access, org settings, billing |
| **Manager** | `manager@anchor.io` | `anchor123` | Team management, SLA configs, rules |
| **Agent** | `sales@anchor.io` | `anchor123` | Chat handling (Number Masking Active) |

---

## 🎯 Testing the Live Meta WhatsApp Simulator

You don't need an approved Meta Business Manager account to test Anchor!
1. Go to the **Inbox** tab in the dashboard.
2. Click **"⚡ Simulate Inbound Lead"** in the top bar.
3. Choose a preset (e.g., *"Budget 2.5 Cr for 3BHK penthouse. Site visit kab kar sakte hain?"*).
4. Click **"Dispatch Inbound Lead"**.
5. Watch the lead appear in real-time, scored **100/100 Intent**, with an instant **<1.4s auto-reply** generated and dispatched!

---

## 📜 License
Private & Proprietary — Anchor Technologies. All rights reserved.
