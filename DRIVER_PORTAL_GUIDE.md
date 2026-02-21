# Driver Portal System - Complete Guide

## Overview
The Fleet Management System now includes an automatic driver portal that creates temporary driver accounts when trips are dispatched.

## Key Features

### 1. Automatic Driver Account Creation
- When a dispatcher assigns a trip, a driver account is automatically created
- Username: Vehicle license plate (e.g., `ABC1234`)
- Password: Auto-generated 8-character random password
- Account is active only during the trip

### 2. Driver Portal Access
- Drivers login at the same login page
- Automatically redirected to driver-specific portal
- Limited access - only see their assigned trip

### 3. Driver Can See:
✅ Active trip details (origin, destination)
✅ Cargo weight information
✅ Distance to travel
✅ Their earnings for the trip
✅ Google Maps navigation button
✅ Trip timeline
✅ Complete trip button

### 4. Driver Cannot See:
❌ Other trips
❌ Fleet dashboard
❌ Vehicle registry
❌ Financial information
❌ Other drivers' data
❌ Company analytics

### 5. Account Lifecycle
1. **Created**: When trip is dispatched by dispatcher
2. **Active**: Driver can login and view trip
3. **Deactivated**: Automatically when driver marks trip complete

## Role Permissions

### Fleet Manager (Full Access)
- ✅ All vehicle operations (CRUD)
- ✅ All trip operations
- ✅ Driver management
- ✅ Maintenance logs
- ✅ Expense tracking
- ✅ Full analytics
- ✅ Create/manage all users

### Dispatcher
- ✅ Create and assign trips
- ✅ Dispatch trips (creates driver accounts)
- ✅ View fleet status
- ✅ View driver list
- ✅ Cancel trips
- ❌ Cannot delete vehicles
- ❌ Cannot manage expenses
- ❌ Limited analytics

### Safety Officer
- ✅ Manage driver compliance
- ✅ Track license expiry
- ✅ Update safety scores
- ✅ Add maintenance logs
- ✅ Suspend drivers
- ❌ Cannot create trips
- ❌ Cannot manage expenses

### Financial Analyst
- ✅ View all expenses
- ✅ Add fuel/expense logs
- ✅ View financial analytics
- ✅ Export reports
- ✅ View ROI calculations
- ❌ Cannot create trips
- ❌ Cannot manage drivers

### Driver (Temporary Account)
- ✅ View assigned trip only
- ✅ See route and navigation
- ✅ View earnings
- ✅ Mark trip complete
- ❌ No access to dashboard
- ❌ No access to other data

## Workflow

### Creating and Dispatching a Trip

1. **Dispatcher/Manager Creates Trip**
   - Select vehicle
   - Select driver
   - Enter cargo weight
   - Enter origin and destination
   - Enter distance (optional)
   - Enter revenue
   - **Enter driver earnings** (new field)
   - Click "Create"

2. **Trip Status: Draft**
   - Trip is created but not active
   - Driver account not yet created
   - Vehicle and driver still available

3. **Dispatcher Clicks "Dispatch"**
   - System automatically:
     - Creates driver user account
     - Username = vehicle license plate
     - Generates random password
     - Shows credentials in popup alert
   - Vehicle status → "On Trip"
   - Driver status → "On Duty"
   - Trip status → "Dispatched"

4. **Share Credentials with Driver**
   - Dispatcher receives popup with:
     ```
     Username: ABC1234
     Password: x7k9m2p5
     ```
   - Share these with the driver (SMS, WhatsApp, etc.)

5. **Driver Logs In**
   - Goes to login page
   - Enters username (license plate)
   - Enters password
   - Automatically redirected to driver portal

6. **Driver Completes Trip**
   - Driver clicks "Mark Trip as Complete"
   - Enters final odometer reading
   - System automatically:
     - Deactivates driver account
     - Updates vehicle status → "Available"
     - Updates driver status → "Off Duty"
     - Trip status → "Completed"
   - Driver is logged out

## Database Changes

### New Fields in `users` table:
```sql
driver_id INTEGER REFERENCES drivers(id)
is_active BOOLEAN DEFAULT true
```

### New Fields in `trips` table:
```sql
driver_user_id INTEGER REFERENCES users(id)
driver_earnings DECIMAL(12, 2) DEFAULT 0
```

### New Role:
- `driver` added to role enum

## API Endpoints

### New Endpoints:
```
GET /api/trips/driver/active
- Get active trip for logged-in driver
- Requires: driver role
- Returns: Trip details or null
```

### Modified Endpoints:
```
PATCH /api/trips/:id/dispatch
- Now creates driver account
- Returns: { trip, driverCredentials }

PATCH /api/trips/:id/complete
- Now deactivates driver account
- Can be called by driver or dispatcher
```

## Security Features

1. **Automatic Account Deactivation**
   - Driver accounts are temporary
   - Deactivated immediately after trip completion
   - Cannot be reused

2. **Role-Based Access Control**
   - Drivers can only access their own trip
   - Cannot see other trips or fleet data
   - Separate portal from admin dashboard

3. **License Validation**
   - System checks license expiry before trip creation
   - Blocks assignment if license expired
   - Prevents suspended drivers from getting trips

## Testing the System

### Test as Dispatcher:
1. Login as: `dispatcher@fleet.com` / `password123`
2. Go to "Trips" page
3. Click "Create Trip"
4. Fill in all fields including driver earnings
5. Click "Create"
6. Click "Dispatch" on the created trip
7. Note the driver credentials shown in popup

### Test as Driver:
1. Logout
2. Login with the credentials from dispatch popup
3. You'll see the driver portal
4. Click "Open Navigation" to test Google Maps
5. Click "Mark Trip as Complete"
6. Enter odometer reading
7. Account will be deactivated

### Test Account Deactivation:
1. Try to login again with same driver credentials
2. Should fail (account deactivated)

## Migration Steps

To update your existing database:

```bash
# Stop the backend server (Ctrl+C)

# Run migration again to add new fields
cd backend
npm run migrate

# Restart backend
npm run dev
```

## Troubleshooting

### Driver can't login:
- Check if trip is dispatched (not just created)
- Verify credentials are correct
- Check if account is active in database

### Driver sees admin dashboard:
- Check user role in database
- Should be 'driver', not other roles
- Clear browser cache and try again

### Credentials not showing after dispatch:
- Check browser popup blocker
- Look in browser console for errors
- Verify backend is running

## Future Enhancements

Potential additions:
- SMS integration to auto-send credentials
- Real-time GPS tracking
- In-app chat with dispatcher
- Photo upload for delivery proof
- Digital signature for delivery confirmation
- Trip history for drivers
- Rating system for drivers
