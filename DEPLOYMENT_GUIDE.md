# Firebase Functions Deployment Guide

## 🚨 CORS Issue Resolution

The CORS error you encountered is now fixed by using HTTP functions instead of callable functions. Here's how to deploy:

## 📋 Prerequisites

1. **Firebase CLI installed:**

   ```bash
   npm install -g firebase-tools
   ```

2. **Logged into Firebase:**

   ```bash
   firebase login
   ```

3. **Project selected:**
   ```bash
   firebase use cryptowallet-bde34
   ```

## 🚀 Deployment Steps

### Step 1: Install Dependencies

```bash
cd functions
npm install
```

### Step 2: Configure Email Credentials

#### Option A: Gmail (Recommended for testing)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Set Firebase config:
   ```bash
   firebase functions:config:set email.user="your-email@gmail.com" email.pass="your-app-password"
   ```

#### Option B: SendGrid (Recommended for production)

1. Create SendGrid account
2. Get API key from SendGrid dashboard
3. Set Firebase config:
   ```bash
   firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
   ```

### Step 3: Deploy Functions

```bash
firebase deploy --only functions
```

### Step 4: Update Email Configuration

After deployment, update the `from` email in `functions/index.js`:

```javascript
// Change this line in both functions:
from: '"Bit Wallet" <your-actual-email@gmail.com>',
```

### Step 5: Redeploy (if you changed the from email)

```bash
firebase deploy --only functions
```

## 🔧 Testing

### Local Testing

```bash
firebase emulators:start --only functions
```

### Production Testing

1. Open your app in browser
2. Go to seed phrase retrieval page
3. Enter an email address
4. Check if OTP is sent (or check alert for testing)

## 📊 Monitoring

### View Function Logs

```bash
firebase functions:log
```

### Check Function Status

```bash
firebase functions:list
```

## 🛠️ Troubleshooting

### Common Issues:

1. **"Function not found" error:**

   - Make sure you deployed the functions
   - Check the function name in the URL

2. **"Email not sent" error:**

   - Check Firebase function logs
   - Verify email credentials are correct
   - Check Gmail/SendGrid settings

3. **CORS errors:**
   - The HTTP function should handle CORS automatically
   - If still having issues, check the function URL

### Debug Commands:

```bash
# View all function logs
firebase functions:log --only sendOTPEmailHttp

# Test function locally
firebase emulators:start --only functions

# Check function config
firebase functions:config:get
```

## 🔒 Security Notes

1. **Email credentials** are stored securely in Firebase config
2. **CORS** is properly configured for the HTTP function
3. **Rate limiting** should be implemented for production
4. **Email validation** is handled on both client and server

## 📈 Production Considerations

1. **Use SendGrid** instead of Gmail for better deliverability
2. **Implement rate limiting** to prevent abuse
3. **Add email validation** on the server side
4. **Monitor function usage** and costs
5. **Set up alerts** for function failures

## 🎯 Expected Behavior

After successful deployment:

- ✅ No CORS errors
- ✅ OTP emails sent successfully
- ✅ Beautiful HTML email templates
- ✅ Proper error handling
- ✅ Fallback to alert for testing

The system will now work without CORS issues and send real emails through Firebase Functions!
