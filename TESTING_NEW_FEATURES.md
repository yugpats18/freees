# Testing Guide - New Features

## Quick Test Steps

### Test 1: User Management (Fleet Manager Only)

1. **Login as Fleet Manager**:
   - Email: `manager@fleet.com`
   - Password: `password123`

2. **Access User Management**:
   - Look for "User Management" in the sidebar
   - Click it

3. **Create a New Dispatcher**:
   - Click "Create New Account"
   - Fill in:
     - Full Name: `Test Dispatcher`
     - Email: `test.dispatcher@fleet.com`
     - Password: `test123`
     - Role: `Dispatcher`
   - Click "Create Account"
   - Should see success message

4. **Verify New User**:
   - Should see the new user in the table
   - Note the role badge color (blue for dispatcher)

5. **Test Access Control**:
   - Logout
   - Login as `dispatcher@fleet.com` / `password123`
   - Try to access User Management
   - Should NOT see it in sidebar (Fleet Manager only)

### Test 2: Unique Driver Credentials Modal

1. **Login as Dispatcher**:
   - Email: `dispatcher@fleet.com` or your new test dispatcher
   - Password: `password123` or `test123`

2. **Create First Trip**:
   - Go to "Trips"
   - Click "Create Trip"
   - Fill in all fields (including Driver Earnings)
   - Click "Create"

3. **Dispatch First Trip**:
   - Click "Dispatch" on the trip
   - **Beautiful modal should appear** with:
     - Username (e.g., `ABC1234_1709123456789`)
     - Password (random 8 chars)
     - Copy buttons
   - **Copy the username** - note the timestamp
   - Click "Close"

4. **Create Second Trip** (Same Vehicle):
   - Create another trip with the SAME vehicle
   - Dispatch it
   - **New modal appears** with DIFFERENT credentials
   - Username will have a DIFFERENT timestamp
   - Password will be DIFFERENT
   - This proves each dispatch creates unique account!

5. **Test Driver Login**:
   - Logout
   - Login with the driver credentials from modal
   - Should see Driver Portal
   - Complete the trip
   - Account will be deactivated

6. **Verify Deactivation**:
   - Try to login again with same credentials
   - Should fail (account deactivated)

### Test 3: OTP Password Reset

1. **Go to Login Page**:
   - Logout if logged in
   - Go to login page

2. **Click Forgot Password**:
   - Click "Forgot Password?" link
   - Should redirect to `/forgot-password`

3. **Request OTP**:
   - Enter email: `manager@fleet.com`
   - Click "Send OTP"
   - **Development Mode**: OTP will show in yellow box
   - **Production**: Check email for OTP

4. **Enter OTP**:
   - Copy the 6-digit OTP
   - Paste it in the OTP field
   - Click "Verify OTP"
   - Should proceed to password reset

5. **Reset Password**:
   - Enter new password: `newpassword123`
   - Confirm password: `newpassword123`
   - Click "Reset Password"
   - Should see success message

6. **Login with New Password**:
   - Go back to login
   - Email: `manager@fleet.com`
   - Password: `newpassword123`
   - Should login successfully

7. **Test OTP Expiry** (Optional):
   - Request another OTP
   - Wait 10 minutes
   - Try to use the OTP
   - Should fail with "OTP expired"

### Test 4: Complete Workflow

1. **As Fleet Manager**:
   - Create a new Dispatcher account
   - Logout

2. **As New Dispatcher**:
   - Login with new account
   - Create a trip
   - Dispatch it
   - See credentials modal
   - Copy credentials
   - Logout

3. **As Driver**:
   - Login with driver credentials
   - View trip in Driver Portal
   - Click "Open Navigation" (Google Maps)
   - Click "Mark Trip as Complete"
   - Enter odometer reading
   - Account deactivated, logged out

4. **Verify Everything**:
   - Try to login as driver again (should fail)
   - Login as dispatcher
   - Check trip status (should be "Completed")
   - Check vehicle status (should be "Available")

## Expected Results

### ✅ User Management:
- Only Fleet Manager can access
- Can create users with different roles
- Users appear in table with correct badges
- Can delete users

### ✅ Driver Credentials:
- Modal appears (not alert)
- Each dispatch creates unique username with timestamp
- Copy buttons work
- Credentials are different every time

### ✅ Password Reset:
- OTP sent successfully
- OTP verification works
- Password reset successful
- Can login with new password
- OTP expires after 10 minutes

### ✅ No Demo Credentials:
- Login page is clean
- No demo credentials shown at bottom

## Troubleshooting

### Modal Not Appearing:
- Check browser console for errors
- Verify backend is running
- Check network tab for API response

### OTP Not Working:
- Check backend console for OTP (development mode)
- Verify email exists in database
- Check OTP hasn't expired

### User Management Not Visible:
- Verify logged in as Fleet Manager
- Check user role in database
- Clear browser cache

### Driver Account Not Unique:
- Check username includes timestamp
- Verify different timestamps for different dispatches
- Check database for multiple driver accounts

## Success Criteria

All features working if:
- ✅ User Management page accessible by Fleet Manager only
- ✅ Can create and delete users
- ✅ Credentials modal appears on dispatch
- ✅ Each dispatch creates unique driver account
- ✅ Copy buttons work in modal
- ✅ OTP password reset flow works
- ✅ OTP expires after 10 minutes
- ✅ No demo credentials on login page
- ✅ Driver accounts deactivate after trip completion

## Next Steps

After testing:
1. Configure email service for production OTP delivery
2. Remove development OTP display
3. Add more user roles if needed
4. Customize email templates
5. Add SMS option for driver credentials
