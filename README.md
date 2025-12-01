# Authentication & RBAC System (Next.js + NestJS + Firebase)

A robust full-stack application implementing secure Authentication, Role-Based Access Control (RBAC), and containerized deployment.

## 🚀 Project Overview

This project demonstrates a secure "Hybrid" authentication architecture using **Next.js** for the frontend and **NestJS** for the backend.

### Core Features

- **Authentication:** Email/Password & Google OAuth via Firebase.
- **Authorization:** JWT verification with server-side RBAC protection.
- **Role Management:** Roles (`user`, `admin`) stored in **Cloud Firestore** for instant updates.
- **Infrastructure:** Fully Dockerized setup with multi-stage builds.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (TypeScript), Tailwind CSS, Context API, Axios.
- **Backend:** NestJS (TypeScript), Firebase Admin SDK.
- **Database:** Cloud Firestore (NoSQL).
- **DevOps:** Docker, Docker Compose.

---

## ⚙️ Configuration: Firebase Setup (Step-by-Step)

To run this project, you need a Firebase project.

1.  **Create Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Enable Authentication:**
    - Go to **Build > Authentication > Sign-in method**.
    - Enable **Email/Password**.
    - Enable **Google** (Follow the prompts).
3.  **Enable Database:**
    - Go to **Build > Firestore Database**.
    - Click **Create Database** and select **Start in Test Mode**.
4.  **Get Frontend Config:**
    - Go to **Project Settings > General**.
    - Scroll to "Your apps", select Web (`</>`), and register the app.
    - Copy the `firebaseConfig` object keys (API Key, Auth Domain, etc.).
5.  **Get Backend Credentials:**
    - Go to **Project Settings > Service accounts**.
    - Click **Generate new private key**.
    - Save this JSON file (or copy its contents for the `.env` file).

---

## 🌱 Environment Variables (.env)

Create a single `.env` file in the **Project Root**. Docker Compose and the apps will read from here.

```ini
# --- FRONTEND CONFIG (Public) ---
# Paste values from Firebase Console > Project Settings > General
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456...
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456...

# --- BACKEND CONFIG (Secret) ---
# Paste values from your service-account.json
# Ensure PRIVATE_KEY is in quotes and includes \n for newlines if using .env directly
PROJECT_ID=your-project-id
CLIENT_EMAIL=firebase-adminsdk-xyz@your-project.iam.gserviceaccount.com
PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQ..."
```

> **Important:** Place your `service-account.json` file inside the `backend/` folder if running locally without env vars, but the Docker setup reads from this root `.env`.

---

## 🐳 How to Run with Docker (Recommended)

This project is configured to start with a single command. Ensure **Docker Desktop** is running.

1.  Run the build and start command:

    ```bash
    docker-compose up --build
    # Note: Use `docker compose up --build` if you are using Docker Compose V2
    ```

2.  Access the Application:

    - **Frontend:** `http://localhost:3001`
    - **Backend Health:** `http://localhost:3000/api/health`

---

## 💻 How to Run Locally (Manual)

### 1\. Start Backend

```bash
cd backend
npm install
# Ensure you have the backend/.env file for firebase or export variables in your shell
npm run start:
```

_Backend runs on: `http://localhost:3000`_

### 2\. Start Frontend

```bash
cd frontend
npm install
# Ensure you have the frontend/.env.local file populated (or root .env linked)
npm run dev
```

_Frontend runs on: `http://localhost:3001` (Next.js automatically detects port 3000 is busy)_

---

## 📡 API Routes Documentation

All backend routes are prefixed with `/api`.

| Method | Endpoint            | Access | Description                                                                    |
| :----- | :------------------ | :----- | :----------------------------------------------------------------------------- |
| `GET`  | `/api/health`       | Public | Health check for Docker/Load Balancers.                                        |
| `POST` | `/api/users`        | Auth   | Initializes a user profile in Firestore. Called automatically on Signup/Login. |
| `GET`  | `/api/profile`      | Auth   | Returns the current user's profile and Role from Firestore.                    |
| `GET`  | `/api/admin/stats`  | Admin  | Returns sensitive system stats. Throws 403 for non-admins.                     |
| `POST` | `/api/demo/promote` | Auth   | _(Demo Feature)_ Promotes current user to Admin instantly.                     |
| `POST` | `/api/demo/demote`  | Auth   | _(Demo Feature)_ Demotes current user to Standard User.                        |

---

## 🔐 Architecture & Authentication Flow

We utilize **Firebase Auth** for Identity and **NestJS** for Authorization.

1.  **Login:** The user logs in on the Frontend (Next.js) using the Firebase Client SDK.
2.  **Token:** Firebase issues a short-lived JWT (Access Token) to the browser.
3.  **Request:** For every API call, the Frontend attaches this token to the Authorization header (`Bearer <token>`).
4.  **Verification (Backend):**
    - The NestJS `AuthGuard` intercepts the request.
    - It verifies the token signature using `firebase-admin`.
    - It extracts the `uid` from the token.
5.  **Enrichment:**
    - The Guard fetches the user's document from Firestore (`users/{uid}`).
    - It attaches the user data (including **role**) to the request object.

### RBAC Logic

Instead of using Firebase Custom Claims (which require token refresh to update), we store roles in Firestore Documents.

**AdminGuard**: For every API call to a protected route, the guard checks the role of the user from the user document. If the role is **admin** a 401 forbidden error is thrown.

---

## 📂 Folder Structure

```bash
project-root/
├── docker-compose.yml
├── README.md
├── backend/                # NestJS
│   ├── src/
│   │   ├── auth/           # Auth Logic
│   │   ├── admin/          # Admin Guard
│   │   ├── firebase/       # Admin SDK & Firestore Providers
│   │   ├── users/          # User Logic & Demo Endpoints
│   │   ├── app.module.ts
│   │   └── main.ts         # Entry point
│   └── Dockerfile          # Multi-stage build for Backend
├── frontend/               # Next.js
│   ├── src/
│   │   ├── app/            # App Router Pages (Login, Dashboard, etc.)
│   │   ├── context/        # AuthContext (Firebase Client Logic)
│   │   └── lib/            # Axios & Firebase Config
│   └── Dockerfile          # Multi-stage build for Frontend
```

---

## 🔮 Future Improvements

If I had more time, I would implement:

- **SSR Authentication:** Migrate from client-side token storage to HTTP-Only cookies. This would allow using Next.js Middleware to protect routes server-side, eliminating loading states on the frontend.
- **Strict Validation:** Implement Server-Side Validation on all incoming requst bodies.
- **Caching:** Introduce Redis to cache the User Role. Currently, we fetch from Firestore on every request. Redis would improve performance at scale.
- **Testing:** Add E2E tests using Cypress to verify the full login-to-dashboard flow automatically.
