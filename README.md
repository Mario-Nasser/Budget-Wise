<div align="center">

<img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge" />
<img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/License-ISC-yellow?style=for-the-badge" />

# 💸 BudgetWise

### *Your money. Your rules. Your data.*

**A full-stack personal finance platform** that helps you track income, manage expenses, set budget limits, and visualize your financial goals — all secured with enterprise-grade authentication.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)

</div>

---

## 🎯 The Problem We Solved

Most people don't overspend because they're careless — they overspend because they **can't see** where their money goes until it's already gone. BudgetWise changes that.

We built a platform that gives you **real-time financial awareness**: track every transaction, set category budgets with automatic over-limit alerts, and visualize your savings goals — all in one place, all in real time.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Secure Authentication** | JWT-based login with bcrypt password hashing and HTTP-only cookies |
| 💰 **Transaction Tracking** | Log income and expenses with categories, dates, and descriptions |
| 📊 **Budget Management** | Set monthly spending limits per category with real-time tracking |
| 🚨 **Smart Alerts** | Automatic notifications when you approach (80%) or exceed (100%) your budget |
| 🎯 **Financial Goals** | Set savings targets with progress tracking and completion percentages |
| 📈 **Reports & Analytics** | Visual breakdowns of spending patterns with pie and bar chart data |
| 📄 **Swagger API Docs** | Fully documented REST API — interactive and explorable via Swagger UI |
| 🔒 **Middleware Security** | Route-level JWT verification protecting all sensitive endpoints |

---

## 🏗️ Architecture

```
BudgetWise/
├── backEnd/                    # TypeScript · Express 5 · MongoDB
│   └── src/
│       ├── controllers/        # Business logic layer (MVC)
│       ├── models/             # Mongoose schemas & data models
│       ├── routes/             # RESTful API route definitions
│       ├── middleware/         # JWT auth, error handling, logging
│       └── app.ts              # App entry point
│
└── frontEnd/                   # HTML · CSS · JavaScript
    ├── pages/                  # Application views
    └── assets/                 # Styles & static resources
```

**Design Patterns Applied:**
- 🏛️ **MVC (Model-View-Controller)** — clean separation of data, logic, and presentation
- 🛡️ **Middleware Pattern** — `verifyToken` intercepts and validates JWT on every protected route
- 📦 **Repository Pattern** — all DB operations abstracted behind Mongoose model methods
- ✅ **SOLID Principles** — each service, controller, and model has a single, well-defined responsibility

---

## 🔌 API Overview

All endpoints are fully documented via **Swagger UI** at `/api-docs` when running locally.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Create a new user account | ❌ |
| `POST` | `/api/auth/login` | Login and receive JWT | ❌ |
| `POST` | `/api/auth/logout` | Invalidate session | ✅ |
| `GET` | `/api/transactions` | Fetch all user transactions | ✅ |
| `POST` | `/api/transactions` | Add a new transaction | ✅ |
| `GET` | `/api/budgets` | Fetch budget limits & status | ✅ |
| `POST` | `/api/budgets` | Create or update a budget | ✅ |
| `GET` | `/api/goals` | Fetch financial goals | ✅ |
| `POST` | `/api/goals` | Create a new savings goal | ✅ |
| `GET` | `/api/reports` | Generate financial report data | ✅ |

> ✅ = Requires `Authorization: Bearer <token>` header

---

## 🛠️ Tech Stack

### Backend
| Technology | Role |
|---|---|
| **TypeScript** | Type-safe server-side development |
| **Node.js + Express 5** | HTTP server & RESTful routing |
| **MongoDB + Mongoose** | NoSQL database with schema validation |
| **JSON Web Tokens (JWT)** | Stateless authentication |
| **bcryptjs** | Password hashing & salting |
| **Swagger (JSDoc + UI)** | Auto-generated interactive API documentation |
| **Morgan** | HTTP request logging middleware |
| **dotenv** | Environment variable management |

### Frontend
| Technology | Role |
|---|---|
| **HTML5 + CSS3** | Responsive layout and styling |
| **JavaScript** | Dynamic UI interactions & API integration |

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+`
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- npm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yasmin-mohamed5/Budget-Wise.git
cd Budget-Wise

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# Fill in: MONGO_URI, JWT_SECRET, PORT
```

### Environment Variables

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
NODE_ENV=development
```

### Running the App

```bash
# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Explore the API
Once running, open your browser at:
```
http://localhost:5000/api-docs
```
Swagger UI gives you an interactive interface to test every endpoint — no Postman needed.

---

## 👥 Team

| Name | Role | GitHub |
|------|------|--------|
| **Yasmin Mohamed Nabil** | Full-Stack · Class Diagram Design | [@yasmin-mohamed5](https://github.com/yasmin-mohamed5) |
| **Mario Nasser Fawzy** | Full-Stack · System Architecture | [@Mario-Nasser](https://github.com/Mario-Nasser) |
| **Lojain Mohammed Abu Elhassan** | Full-Stack · Sequence Diagram Design | [@lojymohamad123](https://github.com/lojymohamad123) |

*Built as part of CS251: Software Engineering — Cairo University, FCAI*

---

## 📐 Software Design Artifacts

This project was backed by comprehensive software engineering documentation:

- 📊 **UML Class Diagram** — Full entity relationships and method signatures
- 🔄 **Sequence Diagrams** — 7 user stories including Sign-Up, Login, Add Transaction, Budget Alerts, and Goal Tracking
- 🗺️ **State Diagram** — Complete user account lifecycle (Unregistered → Authenticated → Session Expired → Locked Out)
- 🏛️ **3-Tier Architecture Diagram** — Presentation, Application, and Data tier components
- 📋 **Software Design Specification (SDS)** — Full HLD documentation

---

<div align="center">

*If this project helped you or impressed you, consider giving it a ⭐ — it means a lot to a team of CS sophomores building real things.*

</div>
