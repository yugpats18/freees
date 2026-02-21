# Fleet Management System

A comprehensive fleet management platform with role-based access control, real-time tracking, and analytics.

## Tech Stack

- **Frontend**: React + TailwindCSS + Recharts
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Authentication**: JWT with RBAC

## Features

- Role-based access control (Fleet Manager, Dispatcher, Safety Officer, Financial Analyst)
- Vehicle registry and tracking
- Trip dispatch and management
- Maintenance logging
- Expense and fuel tracking
- Driver performance monitoring
- Analytics and reporting

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- PostgreSQL (v13+)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migrate
npm run seed
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

### Database Setup

```bash
# Create database
createdb fleet_management

# Run migrations
cd backend
npm run migrate

# Seed sample data
npm run seed
```

## Default Users

- Fleet Manager: `manager@fleet.com` / `password123`
- Dispatcher: `dispatcher@fleet.com` / `password123`
- Safety Officer: `safety@fleet.com` / `password123`
- Financial Analyst: `finance@fleet.com` / `password123`

## API Endpoints

See `backend/API_DOCS.md` for complete API documentation.

## Project Structure

```
fleet-management/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   └── migrations/
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── services/
        └── utils/
```
