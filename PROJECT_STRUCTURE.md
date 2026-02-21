# Fleet Management System - Project Structure

## Overview
Complete fleet management platform with RBAC, real-time tracking, and analytics.

## Folder Structure

```
fleet-management/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # PostgreSQL connection
│   │   ├── controllers/
│   │   │   ├── authController.js    # Login, forgot password
│   │   │   ├── vehicleController.js # CRUD vehicles
│   │   │   ├── tripController.js    # Trip dispatch workflow
│   │   │   ├── maintenanceController.js
│   │   │   ├── expenseController.js
│   │   │   ├── driverController.js
│   │   │   └── analyticsController.js
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT authentication & RBAC
│   │   ├── models/                  # (Database schema in migrations)
│   │   ├── routes/
│   │   │   └── index.js             # All API routes
│   │   ├── migrations/
│   │   │   ├── schema.sql           # Database schema
│   │   │   └── run.js               # Migration runner
│   │   ├── seeds/
│   │   │   └── seed.js              # Sample data
│   │   └── server.js                # Express app entry
│   ├── .env.example
│   ├── package.json
│   └── API_DOCS.md
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx           # Sidebar navigation
│   │   │   └── StatusBadge.jsx      # Color-coded status badges
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Authentication
│   │   │   ├── Dashboard.jsx        # Command center KPIs
│   │   │   ├── Vehicles.jsx         # Vehicle registry CRUD
│   │   │   ├── Trips.jsx            # Trip dispatcher
│   │   │   ├── Maintenance.jsx      # Maintenance logs
│   │   │   ├── Expenses.jsx         # Fuel & expense tracking
│   │   │   ├── Drivers.jsx          # Driver management
│   │   │   └── Analytics.jsx        # Reports & charts
│   │   ├── services/
│   │   │   └── api.js               # Axios API client
│   │   ├── utils/
│   │   │   └── auth.js              # Auth helpers & RBAC
│   │   ├── App.jsx                  # Router & private routes
│   │   ├── index.js                 # React entry
│   │   └── index.css                # Tailwind imports
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── .gitignore
├── README.md
└── PROJECT_STRUCTURE.md
```

## Database Schema

### Tables
1. **users** - Authentication & roles
2. **vehicles** - Fleet registry
3. **drivers** - Driver information & safety
4. **trips** - Trip dispatch & tracking
5. **maintenance_logs** - Service records
6. **expenses** - Fuel & operational costs

### Relationships
- vehicles ← trips → drivers
- vehicles ← maintenance_logs
- vehicles ← expenses

## User Roles & Permissions

### Fleet Manager
- Full access to all modules
- Vehicle CRUD operations
- View all analytics

### Dispatcher
- Create and manage trips
- View vehicles and drivers
- Limited analytics access

### Safety Officer
- Manage drivers
- Add maintenance logs
- View safety metrics

### Financial Analyst
- Manage expenses
- View financial analytics
- Export reports

## Key Features Implemented

### Business Logic
✅ Vehicle capacity validation on trip creation
✅ Driver license expiry check
✅ Auto status updates (Available → On Trip → Available)
✅ Maintenance triggers "In Shop" status
✅ Vehicles in shop excluded from dispatcher
✅ Auto-calculated operational costs
✅ ROI calculation per vehicle

### UI Features
✅ Color-coded status badges
✅ Filterable data tables
✅ Modal forms with validation
✅ Responsive dashboard
✅ Role-based navigation
✅ Charts for analytics (Recharts)
✅ CSV export functionality

## API Endpoints

See `backend/API_DOCS.md` for complete API documentation.

## Setup Commands

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Configure database in .env
npm run migrate
npm run seed
npm run dev

# Frontend
cd frontend
npm install
cp .env.example .env
npm start
```

## Technology Stack

- **Frontend**: React 18, TailwindCSS, Recharts, React Router, Axios
- **Backend**: Node.js, Express, PostgreSQL, JWT, bcrypt
- **Database**: PostgreSQL with proper foreign keys
- **Authentication**: JWT with role-based access control
