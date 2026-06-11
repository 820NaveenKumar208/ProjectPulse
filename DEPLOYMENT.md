# ProjectPulse Deployment Guide

This guide details the process of preparing and deploying the ProjectPulse SaaS platform to a production environment.

---

## ☁️ 1. Database Setup: MongoDB Atlas

In production, ProjectPulse requires a persistent MongoDB database.

1. Create a free account or log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new cluster (Shared tier is sufficient for testing/MVP).
3. Under **Network Access**, add `0.0.0.0/0` (or the specific IP addresses of your hosting servers) to the IP Access List.
4. Under **Database Access**, create a database user with read/write privileges.
5. Retrieve your connection string. It should look like this:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/projectpulse?retryWrites=true&w=majority
   ```

---

## 📦 2. Production Environment Configurations

### Backend Production Environment Variables
| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Production environment flag | `production` |
| `BACKEND_PORT` | Port for the Express server to listen on | `5000` |
| `MONGODB_URI` | Production MongoDB Connection String | `mongodb+srv://...` |
| `SKIP_DATABASE_CONNECTION` | Disable mock storage | `false` |
| `FRONTEND_ORIGIN` | Allowed CORS frontend URL | `https://projectpulse.vercel.app` |
| `JWT_ACCESS_SECRET` | Strong secret for JWT Access Tokens | *Generate a 256-bit random key* |
| `JWT_REFRESH_SECRET` | Strong secret for JWT Refresh Tokens | *Generate a 256-bit random key* |
| `JWT_ACCESS_EXPIRES_IN` | Life of access tokens | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Life of refresh tokens | `7d` |

### Frontend Production Environment Variables
| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | URL of the deployed backend API | `https://api.projectpulse.com/api/v1` |

---

## 🚀 3. Deploying the Backend (e.g. Render / Railway / Heroku)

### Render Deployment Steps
1. Log in to [Render](https://render.com) and click **New +** -> **Web Service**.
2. Connect your Git repository.
3. Configure the service:
   * **Language**: `Node`
   * **Region**: Choose closest to your users.
   * **Branch**: `master` (or main)
   * **Root Directory**: `backend`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm run start`
4. Under **Advanced**, add the environment variables listed above.
5. Click **Deploy Web Service**.

---

## 💻 4. Deploying the Frontend (e.g. Vercel / Netlify / Cloudflare Pages)

### Vercel Deployment Steps
1. Log in to [Vercel](https://vercel.com) and click **Add New** -> **Project**.
2. Import your Git repository.
3. Configure the framework:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   * Key: `VITE_API_BASE_URL`
   * Value: *Your deployed backend service URL* + `/api/v1` (e.g., `https://projectpulse-api.onrender.com/api/v1`)
5. Click **Deploy**.

---

## 🔒 5. Production Hardening & Security Checks

* **Helmet Middleware**: Integrated in `app.ts` to set headers preventing clickjacking, XSS, and mime sniffing.
* **CORS Settings**: `FRONTEND_ORIGIN` must match your frontend domain exactly; wildcard `*` origins are blocked when credentials are sent.
* **Secure Cookies**: If utilizing cookie sessions, set `secure: true` and `httpOnly: true`.
* **JWT Expiry**: Keep access tokens short-lived (`15m` is default) and refresh tokens stored securely.
