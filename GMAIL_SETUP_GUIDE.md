# Gmail Setup Guide for OTP Emails

## Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click on "2-Step Verification"
4. Follow the steps to enable it (you'll need your phone)

## Step 2: Generate App Password

1. After enabling 2-Step Verification, go back to Security
2. Under "Signing in to Google", click on "App passwords"
3. You might need to sign in again
4. In the "Select app" dropdown, choose "Mail"
5. In the "Select device" dropdown, choose "Other (Custom name)"
6. Type: "Fleet Management System"
7. Click "Generate"
8. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

## Step 3: Update Your .env File

1. Open `backend/.env` file
2. Update these lines:

```env
EMAIL_USER=umppg03@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```

Replace `abcdefghijklmnop` with the 16-character app password you copied (remove spaces).

## Step 4: Install Nodemailer

```powershell
cd backend
npm install nodemailer
```

## Step 5: Restart Backend

```powershell
# Stop backend (Ctrl+C)
npm run dev
```

## Step 6: Test Email

1. Go to login page
2. Click "Forgot Password?"
3. Enter: `manager@fleet.com`
4. Click "Send OTP"
5. **Check the email inbox** for umppg03@gmail.com
6. You should receive an email with the OTP

## Troubleshooting

### "Invalid login" error:
- Make sure 2-Step Verification is enabled
- Generate a new App Password
- Copy it without spaces
- Update .env file

### Email not received:
- Check spam folder
- Verify EMAIL_USER is correct
- Verify EMAIL_PASSWORD is the app password (not your regular password)
- Check backend console for errors

### "Less secure app" error:
- Don't use "Less secure apps" - use App Passwords instead
- App Passwords are more secure and work better

## Security Notes

- Never commit your .env file to git
- App passwords are safer than your main password
- You can revoke app passwords anytime from Google Account settings
- Each app should have its own app password

## Alternative: Use Different Email Service

If you want to use a different email service, update the transporter in `authController.js`:

### For Outlook/Hotmail:
```javascript
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

### For Yahoo:
```javascript
const transporter = nodemailer.createTransport({
  service: 'yahoo',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

### For Custom SMTP:
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```
