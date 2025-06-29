# Firebase Functions Email Setup Guide

## Option 1: Firebase Functions with Nodemailer (Recommended)

### Step 1: Initialize Firebase Functions

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase Functions in your project
firebase init functions

# Select your project and choose JavaScript
```

### Step 2: Install Dependencies

```bash
cd functions
npm install nodemailer
```

### Step 3: Configure Email Service

#### Option A: Gmail (Free, Easy Setup)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Set Firebase config:

```bash
firebase functions:config:set email.user="your-email@gmail.com" email.pass="your-app-password"
```

#### Option B: SendGrid (Recommended for Production)

1. Create SendGrid account
2. Get API key from SendGrid dashboard
3. Update the transporter in `functions/index.js`:

```javascript
const transporter = nodemailer.createTransporter({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: functions.config().sendgrid.key,
  },
})
```

4. Set Firebase config:

```bash
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
```

### Step 4: Deploy Functions

```bash
firebase deploy --only functions
```

### Step 5: Update Frontend

The frontend code is already updated to use Firebase Functions. Make sure you have the Firebase Functions SDK:

```html
<!-- Add this to your HTML files -->
<script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-functions.js"></script>
```

## Option 2: Firebase Extensions (Easiest)

### Step 1: Install Email Extension

```bash
firebase ext:install firestore-send-email
```

### Step 2: Configure Extension

Follow the prompts to configure:

- Email service (Gmail, SendGrid, etc.)
- Email templates
- Collection triggers

### Step 3: Use in Code

Instead of calling a function, write to a collection:

```javascript
await addDoc(collection(db, 'mail'), {
  to: email,
  message: {
    subject: 'Your OTP Code',
    html: `<h1>Your OTP: ${otp}</h1>`,
  },
})
```

## Option 3: Firebase Auth Email Templates

For simple email verification, you can use Firebase Auth built-in email templates:

```javascript
// In your signup.js
const actionCodeSettings = {
  url: 'https://your-domain.com/verify-email.html',
  handleCodeInApp: true,
}

await createUserWithEmailAndPassword(auth, email, password)
await sendEmailVerification(auth.currentUser, actionCodeSettings)
```

## Testing

### Local Testing

```bash
firebase emulators:start --only functions
```

### Production Testing

1. Deploy functions
2. Test with real email addresses
3. Check Firebase Functions logs:

```bash
firebase functions:log
```

## Security Best Practices

1. **Environment Variables**: Never hardcode email credentials
2. **Rate Limiting**: Implement rate limiting for OTP requests
3. **Email Validation**: Validate email format before sending
4. **OTP Expiry**: Always set expiration times for OTPs
5. **Logging**: Log email sending attempts for monitoring

## Troubleshooting

### Common Issues:

1. **Gmail "Less secure app" error**: Use App Passwords instead
2. **SendGrid authentication**: Make sure API key is correct
3. **Firebase Functions timeout**: Increase timeout in function config
4. **CORS errors**: Configure CORS in Firebase Functions

### Debug Commands:

```bash
# View function logs
firebase functions:log

# Test function locally
firebase emulators:start --only functions

# Check function config
firebase functions:config:get
```

## Cost Considerations

- **Firebase Functions**: $0.40 per million invocations
- **Gmail**: Free (500 emails/day limit)
- **SendGrid**: Free tier (100 emails/day)
- **Firebase Extensions**: Varies by extension

For production, SendGrid or similar services are recommended for better deliverability and features.
