# ProjectPulse

ProjectPulse is a premium SaaS project tracking and client collaboration portal designed to bridge the gap between project managers and clients. With a modern, highly interactive UI, ProjectPulse provides real-time transparency, automated milestones, AI-powered weekly reporting, and secure public share links.

---

## 🚀 Key Features

* **Project Management Dashboard**: High-level visual metrics (overall progress, health score, active milestone counts) with interactive project analytics.
* **Milestone Tracking & Automatic Statuses**: Dynamic milestone reordering, status transitions, and automatic "delayed" flagging for overdue tasks.
* **Client Approval Workflow**: Seamless approval requests for project phases. Clients can approve or request changes directly in the portal.
* **AI Weekly Reports & PDF Export**: Automatically generated weekly progress reports capturing completed work, pending work, blockers, risks, and health scores, exportable as polished PDFs.
* **Secure Public Share Links**: Generates read-only public links (`/share/:token`) with customizable expiration dates and rotation capabilities, allowing clients to monitor progress without creating accounts.
* **In-App Notification System**: Contextual alerts for milestone completions, approval actions, and report generations.

---

## 🛠️ Technology Stack

### Frontend
* **Core**: React 18, TypeScript, Vite
* **Routing**: React Router DOM v7
* **Styling**: TailwindCSS, CSS Variables, Framer Motion
* **Utilities**: Lucide React (Icons), Recharts (Metrics & graphs), Date-fns (Date manipulation), jsPDF (PDF export)

### Backend
* **Core**: Node.js, Express, TypeScript (running via tsx watch in development)
* **Database**: MongoDB (via Mongoose ODM)
* **Security & Auth**: JSON Web Tokens (JWT), BCrypt password hashing, Helmet, CORS

---

## 📁 Repository Structure

```
projectpulse/
├── backend/
│   ├── src/
│   │   ├── config/        # Environment and DB config
│   │   ├── controllers/   # Request handlers
│   │   ├── middlewares/   # Authentication, error handling
│   │   ├── models/        # Mongoose schemas & typescript interfaces
│   │   ├── routes/        # Router files
│   │   ├── services/      # Business logic (notifications, reports)
│   │   ├── types/         # Custom TypeScript type definitions
│   │   └── utils/         # Helpers (async handler, http errors)
│   ├── vitest.config.ts   # Vitest configuration
│   └── tsconfig.json      # Backend TS setup
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI elements (Header, NotificationBell)
│   │   ├── features/      # Feature-specific state/hooks
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # API clients
│   │   ├── pages/         # Page components (Dashboard, ShareView)
│   │   ├── routes/        # App routing
│   │   ├── styles/        # Global CSS variables & styling
│   │   └── types/         # Typescript types
│   ├── tailwind.config.ts # TailwindCSS config
│   └── vite.config.ts     # Vite setup
├── docs/                  # System architecture, API specifications, and database design
├── README.md              # Project overview (this file)
├── DEPLOYMENT.md          # Production deployment guide
├── ENVIRONMENT_SETUP.md   # Local development setup instructions
└── API_DOCUMENTATION.md   # Complete REST API reference
```

---

## ⚡ Quick Start

### Prerequisites
* Node.js v18+
* MongoDB v6+ (or MongoDB Atlas account)

### Local Installation
1. Clone the repository and install all dependencies:
   ```bash
   npm install
   ```
2. Initialize environment files for both frontend and backend (refer to `ENVIRONMENT_SETUP.md` for specific variables).
3. Start both the frontend and backend in development mode concurrently:
   ```bash
   npm run dev
   ```
4. Access the application at [http://localhost:5173](http://localhost:5173).
