const functions = require('firebase-functions')
const admin = require('firebase-admin')
const nodemailer = require('nodemailer')
const cors = require('cors')({ origin: true })

admin.initializeApp()

// Configure email transporter (you can use Gmail, SendGrid, etc.)
const transporter = nodemailer.createTransporter({
  service: 'gmail', // or 'sendgrid', 'mailgun', etc.
  auth: {
    user: functions.config().email.user, // your-email@gmail.com
    pass: functions.config().email.pass, // your-app-password
  },
})

// Firebase Function to send OTP email
exports.sendOTPEmail = functions.https.onCall(async (data, context) => {
  try {
    const { email, otp } = data

    // Email template
    const mailOptions = {
      from: '"Bit Wallet" <your-email@gmail.com>',
      to: email,
      subject: 'Your Bit Wallet Seed Phrase Recovery OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Bit Wallet</h2>
          <h3>Seed Phrase Recovery</h3>
          <p>Hello,</p>
          <p>You have requested to retrieve your seed phrase from Bit Wallet.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <h2 style="color: #667eea; margin: 0;">Your OTP Code</h2>
            <h1 style="color: #333; font-size: 32px; letter-spacing: 5px; margin: 10px 0;">${otp}</h1>
            <p style="color: #666; margin: 0;">This code will expire in 10 minutes.</p>
          </div>
          <p><strong>Security Notice:</strong></p>
          <ul>
            <li>Never share this OTP with anyone</li>
            <li>Bit Wallet will never ask for this code via phone or email</li>
            <li>If you didn't request this, please ignore this email</li>
          </ul>
          <p>Best regards,<br>Bit Wallet Team</p>
        </div>
      `,
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return { success: true, message: 'OTP email sent successfully' }
  } catch (error) {
    console.error('Error sending email:', error)
    throw new functions.https.HttpsError('internal', 'Failed to send OTP email')
  }
})

// Alternative HTTP function with CORS support (if you prefer HTTP over callable)
exports.sendOTPEmailHttp = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const { email, otp } = req.body

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Email and OTP are required',
        })
      }

      // Email template
      const mailOptions = {
        from: '"Bit Wallet" <your-email@gmail.com>',
        to: email,
        subject: 'Your Bit Wallet Seed Phrase Recovery OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">Bit Wallet</h2>
            <h3>Seed Phrase Recovery</h3>
            <p>Hello,</p>
            <p>You have requested to retrieve your seed phrase from Bit Wallet.</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
              <h2 style="color: #667eea; margin: 0;">Your OTP Code</h2>
              <h1 style="color: #333; font-size: 32px; letter-spacing: 5px; margin: 10px 0;">${otp}</h1>
              <p style="color: #666; margin: 0;">This code will expire in 10 minutes.</p>
            </div>
            <p><strong>Security Notice:</strong></p>
            <ul>
              <li>Never share this OTP with anyone</li>
              <li>Bit Wallet will never ask for this code via phone or email</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
            <p>Best regards,<br>Bit Wallet Team</p>
          </div>
        `,
      }

      // Send email
      await transporter.sendMail(mailOptions)

      return res.status(200).json({
        success: true,
        message: 'OTP email sent successfully',
      })
    } catch (error) {
      console.error('Error sending email:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email',
      })
    }
  })
})
