import express from 'express';
import fetch from 'node-fetch';
import admin from 'firebase-admin';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use(bodyParser.json());
// Adjust CORS origin for production to your domain
app.use(cors({ origin: true }));

// Initialize Firebase Admin
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  const svc = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  admin.initializeApp({ credential: admin.credential.cert(svc) });
} else {
  admin.initializeApp();
}
const db = admin.firestore();

const PAYPAL_MODE = process.env.PAYPAL_MODE === 'live' ? 'api-m.paypal.com' : 'api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
  const tokenUrl = `https://${PAYPAL_MODE}/v1/oauth2/token`;
  const creds = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error('Failed to get PayPal access token: ' + text);
  }
  const j = await res.json();
  return j.access_token;
}

app.post('/paypal/create-order', async (req, res) => {
  try {
    const { amount = '4.99', currency = 'USD' } = req.body || {};
    const accessToken = await getPayPalAccessToken();
    const r = await fetch(`https://${PAYPAL_MODE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: currency, value: amount } }]
      })
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error', details: err.message });
  }
});

app.post('/paypal/capture-order', async (req, res) => {
  try {
    const { orderID, email } = req.body || {};
    if (!orderID) return res.status(400).json({ error: 'orderID required' });
    const accessToken = await getPayPalAccessToken();
    const r = await fetch(`https://${PAYPAL_MODE}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
    });
    const capture = await r.json();
    const status = capture.status || (capture.purchase_units && capture.purchase_units[0]?.payments?.captures?.[0]?.status);
    if (status && status.toUpperCase().includes('COMPLETED')) {
      await db.collection('payments').doc(orderID).set({
        orderID,
        payer: capture.payer || {},
        capture,
        status: 'COMPLETED',
        email: email || (capture.payer && capture.payer.email_address) || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return res.json({ ok: true, capture });
    }
    res.status(400).json({ ok: false, capture });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'capture_failed', details: err.message });
  }
});

app.get('/payments/check', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.json({ paid: false });
    const q = await db.collection('payments')
      .where('email', '==', email)
      .where('status', '==', 'COMPLETED')
      .limit(1)
      .get();
    res.json({ paid: !q.empty });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Webhook placeholder — in production verify signature
app.post('/paypal/webhook', async (req, res) => {
  console.log('paypal webhook', req.body);
  res.status(200).send('ok');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Pay server listening on', PORT));
