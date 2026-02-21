# Setup Instructions - Email & Driver Login

## What Was Fixed

### 1. Driver Login (No @ Required) ✅
- Drivers can now login with just the license plate
- Example: Username: `ABC1234` (not `ABC1234@driver.fleet`)
- Login page now says "Email or License Plate"
- Backend automatically detects driver login

### 2. Email OTP Integration ✅
- Real emails sent using Gmail (umppg03@gmail.com)
- Professional HTML email template
- OTP valid for 10 minutes
- Fallback to console in development if email fails

## Quick Setup Steps

### Step 1: Install Nodemailer

```powershell
cd C:\Users\yugp9\Desktop\ff1\backend
npm install nodemailer
```

### Step 2: Setup Gmail App Password

Follow the detailed guide in `GMAIL_SETUP_GUIDE.md`, but here's the quick version:

1. **Enable 2-Step Verification** on umppg03@gmail.com
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other"
   - Name it "Fleet Management"
   - Copy the 16-character password

3. **Update .env file**
   ```powershell
   notepad backend\.env
   ```
   
   Add these lines:
   ```env
   EMAIL_USER=umppg03@gmail.com
   EMAIL_PASSWORD=your_16_char_app_password_here
   ```

### Step 3: Restart Backend

```powershell
# Stop backend (Ctrl+C in backend terminal)
npm run dev
```

### Step 4: Test Everything

#### Test Driver Login:
1. Login as dispatcher
2. Create and dispatch a trip
3. Copy the driver username (e.g., `ABC1234_1709123456789`)
4. Logout
5. Login with:
   - Username: `ABC1234_1709123456789` (NO @ needed!)
   - Password: (the password from modal)
6. Should see Driver Portal ✅

#### Test Email OTP:
1. Go to login page
2. Click "Forgot Password?"
3. Enter: `manager@fleet.com`
4. Click "Send OTP"
5. **Check email inbox** for umppg03@gmail.com
6. Should receive email with OTP ✅
7. Enter OTP and reset password

## What Changed in Code

### Login Page:
- Input field now accepts email OR license plate
- No @ validation for driver logins
- Helper text added

### Backend Login:
- Detects if input has @ symbol
- If no @, searches for driver accounts
- Matches license plate prefix

### Email System:
- Nodemailer configured for Gmail
- Professional HTML email template
- Error handling with fallback
- Development mode still shows OTP in console

### Driver Credentials Modal:
- Added helper text: "Driver enters this WITHOUT @driver.fleet"
- Makes it clear drivers don't need @

## Testing Checklist

- [ ] Install nodemailer
- [ ] Setup Gmail app password
- [ ] Update .env file
- [ ] Restart backend
- [ ] Test driver login (no @ needed)
- [ ] Test email OTP (check inbox)
- [ ] Verify OTP works
- [ ] Reset password successfully

## Troubleshooting

### Driver Login Not Working:
- Make sure you're using the FULL username from the modal
- Example: `ABC1234_1709123456789` (includes timestamp)
- Don't add @driver.fleet
- Password is case-sensitive

### Email Not Received:
- Check spam folder
- Verify app password is correct (16 chars, no spaces)
- Check backend console for errors
- Make sure 2-Step Verification is enabled

### "Invalid login" Error:
- For Gmail: Use App Password, not regular password
- Check EMAIL_USER and EMAIL_PASSWORD in .env
- Restart backend after changing .env

## Production Notes

### Remove Development OTP Display:
In production, remove the OTP from API response in `authController.js`:

```javascript
res.json({ 
  message: 'OTP sent to your email'
  // Remove: otp: otp
});
```

And remove the yellow development box in `ForgotPassword.jsx`.

### Email Template Customization:
You can customize the email template in `authController.js`:
- Change colors
- Add company logo
- Modify text
- Add footer links

## Support

If you encounter issues:
1. Check `GMAIL_SETUP_GUIDE.md` for detailed Gmail setup
2. Check backend console for error messages
3. Verify .env file has correct values
4. Make sure nodemailer is installed
5. Test with development OTP first (shown in console)
