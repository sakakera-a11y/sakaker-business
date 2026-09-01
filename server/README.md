# Server for secure PayPal payment verification

This server provides endpoints used by the client to create and capture PayPal orders and to record completed payments in Firestore.

Files:
- index.js: Express server that calls PayPal APIs and writes to Firestore.
- package.json

Environment variables (see .env.example):
- PAYPAL_CLIENT_ID
- PAYPAL_SECRET
- PAYPAL_MODE (sandbox or live)
- FIREBASE_SERVICE_ACCOUNT_JSON (optional for local testing)

Recommended deployment: Firebase Cloud Run / Cloud Functions or Vercel (serverless). Use HTTPS and set env vars in your hosting platform.
