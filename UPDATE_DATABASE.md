# Database Update Instructions

## You Need to Update Your Database

The new driver portal features require database schema changes. Follow these steps:

## Option 1: Fresh Start (Recommended if you don't have important data)

```powershell
# 1. Stop the backend server (press Ctrl+C in the backend terminal)

# 2. Drop and recreate the database in pgAdmin:
#    - Open pgAdmin
#    - Right-click on "fleet_management" database
#    - Select "Delete/Drop"
#    - Confirm deletion
#    - Right-click on "Databases"
#    - Create → Database
#    - Name: fleet_management
#    - Save

# 3. Run migrations and seed again
cd C:\Users\yugp9\Desktop\ff1\backend
npm run migrate
npm run seed

# 4. Restart backend
npm run dev
```

## Option 2: Update Existing Database (If you have data to keep)

Run these SQL commands in pgAdmin:

```sql
-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update role check constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst', 'driver'));

-- Add new columns to trips table
ALTER TABLE trips ADD COLUMN IF NOT EXISTS driver_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS driver_earnings DECIMAL(12, 2) DEFAULT 0;
```

### How to Run SQL in pgAdmin:
1. Open pgAdmin
2. Expand Servers → PostgreSQL → Databases → fleet_management
3. Right-click on "fleet_management"
4. Select "Query Tool"
5. Paste the SQL commands above
6. Click the "Execute" button (▶️) or press F5

## Verify Changes

After updating, verify in pgAdmin:

```sql
-- Check users table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';

-- Check trips table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trips';
```

You should see the new columns:
- `users.driver_id`
- `users.is_active`
- `trips.driver_user_id`
- `trips.driver_earnings`

## Restart Application

```powershell
# Backend (if not already running)
cd C:\Users\yugp9\Desktop\ff1\backend
npm run dev

# Frontend (in another terminal)
cd C:\Users\yugp9\Desktop\ff1\frontend
npm start
```

## Test the New Features

1. Login as dispatcher: `dispatcher@fleet.com` / `password123`
2. Create a new trip with driver earnings
3. Dispatch the trip
4. Note the driver credentials shown
5. Logout and login with driver credentials
6. You should see the driver portal!

## Troubleshooting

### Error: "column already exists"
- This is fine, it means the column was already added
- Continue with the next command

### Error: "relation does not exist"
- Make sure you're connected to the correct database
- Check that migrations ran successfully

### Frontend shows errors
- Clear browser cache (Ctrl+Shift+Delete)
- Restart the frontend server
- Check browser console for errors
