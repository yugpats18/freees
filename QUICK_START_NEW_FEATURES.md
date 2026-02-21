# Quick Start - Driver Portal Features

## 🚀 Get Started in 5 Minutes

### Step 1: Update Your Database (Required!)

**Option A - Fresh Start (Easiest):**
```powershell
# Stop backend (Ctrl+C in backend terminal)

# In pgAdmin:
# 1. Right-click "fleet_management" database → Delete
# 2. Right-click "Databases" → Create → Database → Name: fleet_management

# Then run:
cd C:\Users\yugp9\Desktop\ff1\backend
npm run migrate
npm run seed
npm run dev
```

**Option B - Keep Existing Data:**
Open pgAdmin → Query Tool → Run this SQL:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS driver_id INTEGER REFERENCES drivers(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst', 'driver'));
ALTER TABLE trips ADD COLUMN IF NOT EXISTS driver_user_id INTEGER REFERENCES users(id);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS driver_earnings DECIMAL(12, 2) DEFAULT 0;
```

### Step 2: Restart Servers

```powershell
# Backend terminal:
cd C:\Users\yugp9\Desktop\ff1\backend
npm run dev

# Frontend terminal (new window):
cd C:\Users\yugp9\Desktop\ff1\frontend
npm start
```

### Step 3: Test the Driver Portal

1. **Login as Dispatcher:**
   - Email: `dispatcher@fleet.com`
   - Password: `password123`

2. **Create a Trip:**
   - Click "Trips" in sidebar
   - Click "Create Trip"
   - Fill in:
     - Vehicle: Any available vehicle
     - Driver: Any driver
     - Cargo Weight: 1000
     - Origin: New York
     - Destination: Boston
     - Distance: 350
     - Revenue: 1200
     - **Driver Earnings: 400** (NEW FIELD!)
   - Click "Create"

3. **Dispatch the Trip:**
   - Find your trip in the list
   - Click "Dispatch" button
   - **IMPORTANT:** A popup will show driver credentials:
     ```
     Username: ABC1234 (license plate)
     Password: x7k9m2p5 (random)
     ```
   - **Copy these credentials!**

4. **Test Driver Login:**
   - Click "Logout"
   - Login with the driver credentials
   - You'll see the **Driver Portal** (different from admin dashboard!)

5. **Driver Portal Features:**
   - View trip details
   - See earnings
   - Click "Open Navigation" (opens Google Maps)
   - Click "Mark Trip as Complete"
   - Enter odometer reading
   - Account will be deactivated

6. **Verify Deactivation:**
   - Try to login again with same credentials
   - Should fail (account deactivated)

## 🎯 What's New?

### For Dispatchers:
- ✅ New "Driver Earnings" field when creating trips
- ✅ Auto-generated driver credentials when dispatching
- ✅ Credentials shown in popup alert
- ✅ Share credentials with driver via SMS/WhatsApp

### For Drivers:
- ✅ Temporary login account (username = license plate)
- ✅ Dedicated driver portal
- ✅ View assigned trip only
- ✅ Google Maps navigation
- ✅ See earnings
- ✅ Complete trip button
- ✅ Account auto-deactivates after completion

### For Fleet Managers:
- ✅ Full control over all features
- ✅ Can see all trips and driver accounts
- ✅ Manage driver compliance and safety

## 📱 Real-World Usage

**Scenario:** You need to send a driver on a delivery

1. **Dispatcher creates trip** in system
2. **Dispatcher dispatches trip** → Gets credentials
3. **Dispatcher texts driver:**
   ```
   Your trip is ready!
   Login: ABC1234
   Password: x7k9m2p5
   Go to: fleet-app.com/login
   ```
4. **Driver logs in** on phone/tablet
5. **Driver clicks navigation** → Google Maps opens
6. **Driver completes delivery**
7. **Driver marks complete** → Account closes
8. **System updates** everything automatically

## 🔒 Security

- Driver accounts are single-use only
- Auto-deactivated after trip completion
- Drivers can't see other trips or fleet data
- Separate portal from admin dashboard
- License validation before trip assignment

## 📊 Role Permissions

**Fleet Manager:** Everything
**Dispatcher:** Create/dispatch trips, view fleet
**Safety Officer:** Driver compliance, maintenance
**Financial Analyst:** Expenses, analytics
**Driver:** View own trip only

## 🐛 Troubleshooting

**Driver can't login:**
- Make sure trip is "Dispatched" (not just "Draft")
- Check credentials are correct (case-sensitive)
- Verify account is active

**Credentials not showing:**
- Check for popup blocker
- Look in browser console
- Verify backend is running

**Database errors:**
- Run the SQL update commands
- Or drop and recreate database
- Then run migrations again

## 📚 More Documentation

- `DRIVER_PORTAL_GUIDE.md` - Complete feature guide
- `UPDATE_DATABASE.md` - Database update instructions
- `IMPLEMENTATION_SUMMARY.md` - Technical details
- `README.md` - General setup

## 🎉 You're Ready!

The driver portal is now fully functional. Test it out and enjoy the automated workflow!
