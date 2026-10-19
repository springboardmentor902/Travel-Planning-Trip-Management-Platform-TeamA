# 🌍 TripNest

<p align="center">
  <strong>A full-stack, collaborative trip planning and group expense management platform.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-4.1.1-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Java-25-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 25" />
  <img src="https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4.19-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/PostgreSQL-Ready-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Mapbox-GL%20JS-000000?style=for-the-badge&logo=mapbox&logoColor=white" alt="Mapbox" />
  <img src="https://img.shields.io/badge/Cloudinary-Media%20Vault-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary" />
</p>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Environment Configuration](#-environment-configuration)
  - [Backend Configuration](#backend-configuration-tripnest-backendenv)
  - [Frontend Configuration](#frontend-configuration-tripnest-frontendenv)
- [Quick Start Guide](#-quick-start-guide)
  - [Running the Backend](#1-running-the-backend)
  - [Running the Frontend](#2-running-the-frontend)
- [Core REST API Reference](#-core-rest-api-reference)
- [Docker & Production Deployment](#-docker--production-deployment)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Contributing & License](#-contributing--license)

---

## 🧭 Overview

**TripNest** simplifies travel planning and group coordination. Whether you're planning a solo getaway or organizing an expedition with friends, TripNest eliminates the chaos of disjointed spreadsheets, chat threads, and manual expense calculations.

With TripNest, travelers can:
- Craft day-by-day itineraries and schedule group activities.
- Explore popular destinations with integrated **Mapbox** geolocation and search.
- Split shared trip costs and calculate minimal-transaction debt settlements (**Splitwise-style**).
- Store tickets, hotel bookings, and photos in a secure **Cloudinary** media vault.
- Receive automated trip reminders, itinerary schedules, and email notifications.
- Monitor travel budgets and spending patterns through rich **Recharts** visualizations.

---

## 🚀 Key Features

### 🗺️ Itinerary & Destination Planning
- **Interactive Trip Planner**: Define start/end dates, budgets, cover images, and travel details.
- **Day-by-Day Itineraries**: Schedule detailed activities per day with specific locations, times, and notes.
- **Curated Destinations**: Browse popular destinations (pre-seeded with top travel spots like Goa, Manali, Rajasthan, Kerala, Ladakh, Agra, and Shimla) with Mapbox location discovery.

### 👥 Group Collaboration & Invites
- **Collaborative Trips**: Form trip groups and invite travel companions via email.
- **Invitation Workflow**: Invitees can accept or decline trip invites directly from their notifications dashboard.
- **Role & Access Controls**: Trip organizers can manage member permissions and remove group participants when needed.

### 💸 Smart Expenses & Debt Settlement
- **Multi-Payer Expense Tracking**: Log expenses categorized by Food, Transport, Accommodation, Activities, or Miscellaneous.
- **Splitwise-Style Debt Minimization**: Built-in settlement algorithm calculates the exact minimum number of cash transfers required to settle all debts across group members.
- **Live Spending Breakdown**: Track actual spending against the budgeted threshold in real-time.

### 📁 Cloud Document & Photo Vault
- **Multi-Format Uploads**: Safely store tickets, boarding passes, hotel reservations, IDs, and travel memories.
- **Cloudinary Integration**: Direct-to-cloud asset storage with thumbnail generation and categorized filtering (Tickets, Bookings, IDs, Photos).

### 📊 Analytics & Reporting
- **Dynamic Charts**: Interactive spending vs. budget breakdowns powered by Recharts.
- **Trip Summary Reports**: Export detailed travel breakdowns and expense summaries for personal archiving or group reconciliation.

### 🔔 Automated Reminders & Notifications
- **Spring Mail Notifications**: Automated invitation emails and activity reminders sent straight to your inbox.
- **Background Cron Scheduler**: Automatically triggers reminders for approaching trips and scheduled itinerary activities.

### 🛡️ Enterprise-Grade Security
- **Stateless JWT Authentication**: Secure password encryption and Bearer token verification on protected endpoints.
- **Google OAuth2 Social Login**: Seamless one-click sign-in via Google credentials.
- **Role-Based Authorization**: Distinct access levels for standard travelers (`ROLE_USER`) and platform administrators (`ROLE_ADMIN`).

---

## 🛠 Architecture & Tech Stack

### Frontend
| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) | Modern UI component hierarchy with functional hooks |
| **Build Tool** | [Vite 8](https://vite.dev/) | Ultra-fast Hot Module Replacement (HMR) and bundling |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) | Responsive, utility-first UI styling |
| **Routing** | [React Router 7](https://reactrouter.com/) | Client-side routing with protected route guards |
| **Maps & Search** | [Mapbox GL JS](https://www.mapbox.com/) | Interactive maps and autocomplete search integration |
| **Charts** | [Recharts 3](https://recharts.org/) | Declarative charting for budgets, expenses, and trends |
| **HTTP Client** | [Axios](https://axios-http.com/) | Interceptor-configured REST client with JWT attachment |

### Backend
| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Spring Boot 4.1.1](https://spring.io/projects/spring-boot) | REST API microservice architecture |
| **Language** | [Java 25](https://openjdk.org/projects/jdk/25/) | Latest LTS modern Java language features |
| **Security** | Spring Security + JJWT 0.11.5 | Stateless JWT authentication filter and password encoding |
| **OAuth2** | Spring Security OAuth2 Client | Google OAuth2 social login integration |
| **Persistence** | Spring Data JPA / Hibernate | Object-relational mapping with PostgreSQL / MySQL support |
| **Cloud Storage**| Cloudinary Java SDK | Cloud storage for travel media and trip documents |
| **Mailing** | Spring Boot Starter Mail | SMTP client for automated invitations and reminder emails |
| **Scheduling** | Spring `@EnableScheduling` & `@EnableAsync` | Background tasks for trip status updates and email dispatch |

---

## 📂 Project Structure

```text
tripnest/
├── tripnest-backend/                # Spring Boot 4 Backend Application
│   ├── src/main/java/com/tripnest/backend/
│   │   ├── config/                  # Security, Cloudinary, and Web MVC configs
│   │   ├── controllers/             # REST API Controllers (Trips, Expenses, Auth, etc.)
│   │   ├── dto/                     # Request and Response Data Transfer Objects
│   │   ├── entity/                  # JPA Database Entities
│   │   ├── repository/              # Spring Data JPA Repositories
│   │   ├── security/                # JwtUtil, JwtAuthFilter, and OAuth2 handlers
│   │   ├── service/                 # Business logic, schedulers, and settlement engines
│   │   └── BackendApplication.java  # Main runner with automated seed data
│   ├── src/main/resources/
│   │   ├── application.properties   # Base properties & environment imports
│   │   └── application-prod.properties # Production datasource & cloud credentials
│   ├── Dockerfile                   # Multi-stage production container build
│   ├── pom.xml                      # Maven dependencies & build configuration
│   └── mvnw / mvnw.cmd              # Maven wrapper scripts
│
├── tripnest-frontend/               # React 19 + Vite Frontend Application
│   ├── src/
│   │   ├── assets/                  # Static media, icons, and illustrations
│   │   ├── components/              # Reusable UI components (Navbar, Modals, Cards, Maps)
│   │   ├── context/                 # React Context providers (Auth, Notifications)
│   │   ├── pages/                   # Views (Dashboard, Trips, Expenses, Itinerary, etc.)
│   │   ├── utils/                   # Axios client instance, Mapbox helpers, formatters
│   │   ├── App.jsx                  # Root router configuration
│   │   └── main.jsx                 # React DOM mount point
│   ├── package.json                 # Node dependencies and scripts
│   ├── tailwind.config.js           # Tailwind theme configuration
│   ├── vercel.json                  # SPA fallback rewrites for deployment
│   └── vite.config.js               # Vite bundler plugins and settings
│
└── README.md                        # Project documentation (this file)
```

---

## 📋 Prerequisites

Before running the project locally, verify that your machine has the following tools installed:

- **Java Development Kit (JDK)**: Java 25 or Java 21+
- **Node.js**: `v18.0.0` or later (LTS recommended)
- **Package Manager**: `npm` (comes with Node.js)
- **Database**: PostgreSQL 14+ (or MySQL 8+)
- **Build Tool**: Apache Maven (optional; project includes `./mvnw` and `mvnw.cmd`)

---

## ⚙️ Environment Configuration

### Backend Configuration (`tripnest-backend/.env`)

Create a `.env` file in the `tripnest-backend/` root directory (do not commit real credentials):

```properties
# -------------------------------------------------------------
# Database Configuration (PostgreSQL / MySQL / Supabase)
# -------------------------------------------------------------
DB_URL=jdbc:postgresql://localhost:5432/tripnest
DB_USERNAME=postgres
DB_PASSWORD=your_database_password

# -------------------------------------------------------------
# Server Port & Frontend Origin
# -------------------------------------------------------------
PORT=8080
FRONTEND_URL=http://localhost:5173

# -------------------------------------------------------------
# SMTP Email Notifications (Gmail or custom SMTP provider)
# -------------------------------------------------------------
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_specific_password

# -------------------------------------------------------------
# Cloudinary Media Storage (For documents & cover photos)
# -------------------------------------------------------------
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# -------------------------------------------------------------
# Google OAuth2 Authentication (Optional for Google Sign-in)
# -------------------------------------------------------------
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

> **Note**: On startup, `BackendApplication.java` will automatically verify and seed default system roles (`ROLE_USER`, `ROLE_ADMIN`) and popular Indian travel destinations if the database tables are empty.

### Frontend Configuration (`tripnest-frontend/.env`)

Create a `.env` file in the `tripnest-frontend/` root directory:

```properties
# -------------------------------------------------------------
# Backend API Base URL
# -------------------------------------------------------------
VITE_API_BASE_URL=http://localhost:8080

# -------------------------------------------------------------
# Mapbox Public Access Token (For interactive maps & search)
# -------------------------------------------------------------
VITE_MAPBOX_TOKEN=pk.your_mapbox_public_access_token
```

---

## 🏃 Quick Start Guide

### 1. Running the Backend

Open a terminal and navigate to the backend folder:

**Windows (PowerShell):**
```powershell
cd tripnest-backend
.\mvnw.cmd spring-boot:run
```

**Linux / macOS (Bash):**
```bash
cd tripnest-backend
chmod +x mvnw
./mvnw spring-boot:run
```

The Spring Boot server will start on `http://localhost:8080`.

---

### 2. Running the Frontend

Open a second terminal and navigate to the frontend folder:

**Windows / Linux / macOS:**
```bash
cd tripnest-frontend
npm install
npm run dev
```

Open your browser and navigate to:
```text
http://localhost:5173
```

---

## 📡 Core REST API Reference

All protected endpoints require the following HTTP header:
```http
Authorization: Bearer <your_jwt_token>
```

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user account | ❌ |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | ❌ |
| `GET` | `/oauth2/authorization/google` | Trigger Google OAuth2 social login flow | ❌ |

### 🧳 Trips & Group Members (`/api/trips`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/trips` | Retrieve all trips for the authenticated user | ✅ |
| `POST` | `/api/trips` | Create a new trip | ✅ |
| `GET` | `/api/trips/{id}` | Get full trip details by ID | ✅ |
| `PUT` | `/api/trips/{id}` | Update existing trip details | ✅ |
| `DELETE`| `/api/trips/{id}` | Delete a trip | ✅ |
| `PATCH`| `/api/trips/{id}/status` | Update trip status (`PLANNING`, `ONGOING`, `COMPLETED`) | ✅ |
| `POST` | `/api/trips/{id}/invite` | Invite a collaborator via email | ✅ |
| `GET` | `/api/trips/{id}/members` | List all members and their roles for a trip | ✅ |
| `PATCH`| `/api/trips/{id}/accept` | Accept a pending trip invitation | ✅ |
| `PATCH`| `/api/trips/{id}/decline` | Decline a pending trip invitation | ✅ |
| `DELETE`| `/api/trips/{id}/members/{memberId}` | Remove a member from a trip | ✅ |
| `GET` | `/api/trips/invitations/pending`| Get all pending invitations for the current user | ✅ |

### 📅 Itinerary & Activities (`/api/itineraries`, `/api/activities`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/itineraries/trip/{tripId}` | Get daily itinerary plans for a specific trip | ✅ |
| `POST` | `/api/itineraries` | Add a new itinerary day | ✅ |
| `POST` | `/api/activities` | Add an activity to an itinerary day | ✅ |
| `PUT` | `/api/activities/{id}` | Update an activity schedule or details | ✅ |
| `DELETE`| `/api/activities/{id}` | Delete an activity | ✅ |

### 💰 Expenses & Settlement (`/api/expenses`, `/api/trips/{tripId}/settlement`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/trips/{tripId}/expenses` | Retrieve all expenses logged for a trip | ✅ |
| `POST` | `/api/trips/{tripId}/expenses` | Add a new expense (amount, payer, category, date) | ✅ |
| `GET` | `/api/trips/{tripId}/expenses/summary` | Get aggregated expense summary & budget utilization | ✅ |
| `GET` | `/api/trips/{tripId}/expenses/category?cat={CATEGORY}` | Filter expenses by category | ✅ |
| `GET` | `/api/trips/{tripId}/settlement` | **Compute optimized minimum-transaction debt settlement** | ✅ |
| `PUT` | `/api/expenses/{id}` | Edit an existing expense | ✅ |
| `DELETE`| `/api/expenses/{id}` | Delete an expense record | ✅ |

### 📁 Document Vault (`/api/trips/{tripId}/documents`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/trips/{tripId}/documents` | Upload a document or photo (multipart/form-data) | ✅ |
| `GET` | `/api/trips/{tripId}/documents` | List all documents and media for a trip | ✅ |
| `DELETE`| `/api/documents/{id}` | Remove a document from the vault and Cloudinary | ✅ |

### 📍 Destinations & Discovery (`/api/destinations`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/destinations` | List all curated destinations | ❌ / ✅ |
| `GET` | `/api/destinations/popular` | Retrieve top popular destinations | ❌ / ✅ |

### 📊 Dashboard & Analytics (`/api/dashboard`, `/api/analytics`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/dashboard` | Get quick stats for user dashboard (upcoming trips, pending invites) | ✅ |
| `GET` | `/api/analytics` | Get spending trends, travel frequency, and budget analytics | ✅ |

---

## 🐳 Docker & Production Deployment

### Backend Container Build

A multi-stage `Dockerfile` is provided in `tripnest-backend/`:

```bash
cd tripnest-backend
docker build -t tripnest-backend:latest .
docker run -p 8080:8080 --env-file .env tripnest-backend:latest
```

### Frontend Production Build

The frontend includes a pre-configured `vercel.json` with SPA rewrite rules for instantaneous deployment on **Vercel** or any static host:

```bash
cd tripnest-frontend
npm run build
```
The compiled output is generated in `tripnest-frontend/dist/`.

---

## 🧪 Testing & Quality Assurance

Run the test suites and linting checks:

### Backend Testing
```powershell
cd tripnest-backend
.\mvnw.cmd clean test
```

### Frontend Linting & Build Verification
```powershell
cd tripnest-frontend
npm run lint
npm run build
```

---

## 🤝 Contributing & License

Contributions, feature requests, and bug reports are welcome!

1. **Fork** the project repository.
2. **Create** your feature branch: `git checkout -b feature/AmazingFeature`
3. **Commit** your changes: `git commit -m 'Add some AmazingFeature'`
4. **Push** to the branch: `git push origin feature/AmazingFeature`
5. **Open** a Pull Request.

<p align="center">
  Made with ❤️ by the TripNest Team
</p>

