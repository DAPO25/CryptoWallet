# EmailJS Setup Guide for OTP Emails

## Current Status

The OTP system is currently showing OTP codes in an alert for development/testing purposes. To enable real email sending, follow these steps:

## Step 1: Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Add Email Service

1. In EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the authentication steps
5. Note down your Service ID

## Step 3: Create Email Template

1. Go to "Email Templates"
2. Click "Create New Template"
3. Use this template:

```html
Subject: Your Bit Wallet Seed Phrase Recovery OTP Hello, You have requested to
retrieve your seed phrase from Bit Wallet. Your 6-digit OTP code is:
{{otp_code}} This code will expire in 10 minutes. If you didn't request this,
please ignore this email. Best regards, Bit Wallet Team
```

4. Note down your Template ID

## Step 4: Update JavaScript Code

1. Open `js/retrieve-seedphrase.js`
2. Replace the placeholder values:

```javascript
// Initialize EmailJS
emailjs.init('YOUR_PUBLIC_KEY') // Get from EmailJS dashboard

// In sendOTPEmail function, replace:
;('YOUR_SERVICE_ID') // With your actual Service ID
;('YOUR_TEMPLATE_ID') // With your actual Template ID
```

## Step 5: Enable Real Email Sending

1. In `js/retrieve-seedphrase.js`
2. Comment out or remove the alert line:

```javascript
// alert(`OTP Code: ${otp}...`);
```

3. Uncomment the EmailJS implementation:

```javascript
const templateParams = {
  to_email: email,
  otp_code: otp,
  user_email: email,
}

try {
  await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
  console.log('Email sent successfully')
} catch (emailError) {
  console.error('Email sending failed:', emailError)
}
```

## Alternative: Use Firebase Functions

For a more secure solution, consider using Firebase Functions with a service like SendGrid or Mailgun.

## Testing

- The current implementation shows OTP in alert for testing
- OTP is stored in Firebase and can be verified
- All other functionality works as expected

## Security Notes

- EmailJS credentials are public, so don't store sensitive data
- Consider rate limiting for OTP requests
- Monitor for abuse and implement CAPTCHA if needed
