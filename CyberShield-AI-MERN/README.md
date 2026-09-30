# CyberShield AI - MERN Stack

AI-powered phishing detection, cyber safety dashboard, and role-based threat management platform built with MongoDB, Express.js, React and Node.js.

## Key Features
- **Welcome to CyberShield AI Pre-Login Portal**: Branded introductory screen introducing the platform, AI threat features, and interactive User/Admin authentication.
- **Role-Based Authentication**:
  - **Standard Users**: Register & log in with any email and password.
  - **System Administrators**: Access restricted strictly to the 2 designated admin emails (`admin@cybershield.ai` and `security@cybershield.ai`, configurable in `server/.env`).
- **Separate User History**: Every user has isolated private scan history and analytics. Regular users cannot see other users' scans.
- **Threat Collections**: Organize and categorize analyzed threats, phishing URLs, and verified safe items into custom user folders.
- **Admin Control Center**: Administrators have full oversight to audit all registered users, total scans across accounts, and system-wide security analytics.
- **AI Threat Scanner**: Real-time explainable analysis for URLs, emails, and SMS.
- **Cyber Safety Assistant**: Rule-based AI assistant for security questions and fraud prevention.

## Pre-Configured Accounts (1-Click Demo)
- **Admin 1**: `admin@cybershield.ai` (Password: `Admin@12345`)
- **Admin 2**: `security@cybershield.ai` (Password: `Admin@12345`)
- **Standard User**: Any email (e.g. `user@example.com` / `User@12345`)

## Run on Windows

### 1. Backend
```powershell
cd server
npm install
npm run dev
```

### 2. Frontend
Open another terminal:
```powershell
cd client
npm install
npm run dev
```

Open the URL shown by Vite (normally `http://localhost:5173` or `http://localhost:5174`).

### 3. Environment Variables (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/cybershield
JWT_SECRET=cybershield_super_secure_jwt_token_secret_2026
ADMIN_EMAILS=admin@cybershield.ai,security@cybershield.ai
DEFAULT_ADMIN_PASSWORD=Admin@12345
```
