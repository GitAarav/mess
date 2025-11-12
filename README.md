# MessHelp - Campus Delivery Request System

A full-stack web application that connects students who need items delivered from campus mess halls with students willing to fulfill those requests for a fee.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Known Issues & Limitations](#known-issues--limitations)
- [Security Considerations](#security-considerations)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

MessHelp is a peer-to-peer delivery platform designed for campus environments where students can:
- Create delivery requests for items from mess halls
- Browse and accept delivery requests from other students
- Track order status in real-time
- Manage their delivery history

## ✨ Features

### For Requesters
- 🔐 Google OAuth authentication
- 📝 Create delivery requests with item name and price
- 👀 View real-time status of their orders
- ✅ Acknowledge completed deliveries
- 🗑️ Cancel pending requests
- 📊 View order history

### For Deliverers
- 🔍 Browse available delivery requests
- 🤝 Accept delivery jobs
- ✓ Mark deliveries as completed
- 📋 Track active and completed deliveries
- 💰 View earnings from completed deliveries

### General
- 🏢 Multi-mess block support (A, B, C Blocks)
- 📱 Responsive design for mobile and desktop
- 🔄 Auto-refresh for real-time updates (polling every 5s)
- 🛡️ Protected routes with authentication
- ⚠️ Error boundary for graceful error handling

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **React Router DOM** - Client-side routing
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase** - Authentication (Google OAuth)
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js 5** - Web framework
- **PostgreSQL** - Relational database
- **Firebase Admin SDK** - Token verification
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
.
├── client/                  # Frontend React application
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   │   └── ErrorBoundary.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── ProfileSetup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Requests.jsx
│   │   │   ├── MyOrders.jsx
│   │   │   └── MyDeliveries.jsx
│   │   ├── services/        # API service layer
│   │   │   ├── api.js
│   │   │   └── requestService.js
│   │   ├── firebase.js      # Firebase configuration
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # App entry point
│   │   └── index.css        # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                  # Backend Express application
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   │   ├── authRoutes.js
│   │   │   └── requests.js
│   │   └── db.js            # Database connection
│   ├── server.js            # Server entry point
│   ├── package.json
│   ├── messHelp.sql         # Initial database schema
│   └── migration_add_columns.sql  # Schema updates
│
└── README.md
```

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher)
- **Firebase Project** with Google OAuth enabled
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd messhelp
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../server
npm install
```

## ⚙️ Configuration

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable **Google Authentication** in Authentication > Sign-in method
4. Add your domain to authorized domains
5. Generate a service account key (Settings > Service accounts > Generate new private key)
6. Copy credentials to your `.env` files

## 🗄️ Database Setup

### 1. Create PostgreSQL Database

```bash
psql -U postgres
CREATE DATABASE messhelp;
\q
```

### 2. Run Initial Schema

```bash
psql -U postgres -d messhelp -f server/messHelp.sql
```

### 3. Run Migration

```bash
psql -U postgres -d messhelp -f server/migration_add_columns.sql
```

### 4. Verify Tables

```sql
-- Connect to database
psql -U postgres -d messhelp

-- Check tables
\dt

-- Expected tables:
-- Messes
-- Users
-- Requests
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd server
npm start
# Server runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

### Production Build

**Frontend:**
```bash
cd client
npm run build
npm run preview
```

**Backend:**
```bash
cd server
NODE_ENV=production npm start
```

## 📡 API Documentation

### Authentication Endpoints

#### Check User Exists
```http
GET /auth/check
Authorization: Bearer <firebase_token>
```

**Response:**
```json
{
  "exists": true,
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "room_number": "A-101",
    "phone_number": "+91 9876543210",
    "default_mess_id": 1
  }
}
```

#### Register User
```http
POST /auth/register
Authorization: Bearer <firebase_token>
Content-Type: application/json

{
  "room_number": "A-101",
  "phone_number": "+91 9876543210",
  "default_mess_id": 1
}
```

### Request Endpoints

#### Get Open Requests
```http
GET /requests/open
Authorization: Bearer <firebase_token>
```

#### Create Request
```http
POST /requests
Authorization: Bearer <firebase_token>
Content-Type: application/json

{
  "title": "Coffee from mess",
  "description": "50"
}
```

#### Accept Request
```http
PATCH /requests/:id/accept
Authorization: Bearer <firebase_token>
```

#### Complete Request
```http
PATCH /requests/:id/complete
Authorization: Bearer <firebase_token>
```

#### Acknowledge Completion
```http
PATCH /requests/:id/acknowledge
Authorization: Bearer <firebase_token>
```

#### Cancel Request
```http
DELETE /requests/:id
Authorization: Bearer <firebase_token>
```

#### Get My Orders
```http
GET /requests/my-orders
Authorization: Bearer <firebase_token>
```

#### Get My Deliveries
```http
GET /requests/my-deliveries
Authorization: Bearer <firebase_token>
```

#### Get Active Requests
```http
GET /requests/active
Authorization: Bearer <firebase_token>
```

