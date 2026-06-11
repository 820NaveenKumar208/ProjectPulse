# Local Development Environment Setup

This document provides setup instructions for developers running ProjectPulse locally.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed:
* **Node.js** (v18.x or v20.x recommended)
* **npm** (v9.x or higher)
* **MongoDB** Community Server running locally, OR an active MongoDB Atlas cluster URI.

---

## 🛠️ Step-by-Step Setup

### 1. Clone & Install Dependencies
From the repository root, install dependencies for the workspaces:
```bash
npm install
```
This will automatically configure Node workspaces for `frontend` and `backend`.

### 2. Configure Backend Environment Variables
Create a `.env` file in the `backend/` directory:
```bash
cp backend/.env.example backend/.env
```
Ensure the variables are configured:
```ini
NODE_ENV=development
BACKEND_PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/projectpulse
SKIP_DATABASE_CONNECTION=false # Set to true only if you want to skip local DB connection (uses mock users but breaks project persistence)
FRONTEND_ORIGIN=http://localhost:5173
JWT_ACCESS_SECRET=projectpulse-dev-access-secret
JWT_REFRESH_SECRET=projectpulse-dev-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### 3. Configure Frontend Environment Variables
Create a `.env` file in the `frontend/` directory:
```bash
cp frontend/.env.example frontend/.env
```
Set the API base URL:
```ini
VITE_API_BASE_URL=http://127.0.0.1:5000/api/v1
```

### 4. Start the Application
Run the concurrent dev server script from the project root:
```bash
npm run dev
```
* **Frontend Port**: Runs at [http://127.0.0.1:5173](http://127.0.0.1:5173)
* **Backend Port**: Runs at [http://127.0.0.1:5000](http://127.0.0.1:5000)

---

## 🧪 Running Tests

### Backend Unit & Integration Tests
To run all tests in isolation with MongoDB Memory Server:
```bash
npm run test --workspace backend
```

To run tests in watch mode:
```bash
npm run test:watch --workspace backend
```

---

## 🔍 Troubleshooting

### Port Conflicts
If port `5000` is already in use by another process:
1. Identify the blocking process on port 5000:
   * **Windows**: `netstat -ano | findstr 5000`
   * **macOS/Linux**: `lsof -i :5000`
2. Terminate the process or change `BACKEND_PORT` inside `backend/.env` (remember to update `VITE_API_BASE_URL` in the frontend `.env` to match).

### MongoDB Connection Failures
If you get `MongooseServerSelectionError`:
1. Ensure your local MongoDB Service is running:
   * **Windows**: Run `services.msc`, locate `MongoDB Server`, and click **Start**.
   * **macOS**: `brew services start mongodb-community`
2. If using a remote URI (Atlas), confirm your network IP whitelist permits the local connection.
