import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the raw body and signature
    const body = JSON.stringify(req.body);
    const signature = req.headers['x-ercaspay-signature'] || '';

    console.log('ErcasPay webhook received:', body);

    // Process the webhook using Convex action
    const result = await convex.action("ercasPayActions:processDepositWebhook", {
      body: body,
      signature: signature,
    });

    console.log('Webhook processing result:', result);

    // Return success response to ErcasPay
    res.status(200).json({ 
      success: true, 
      message: result.message || 'Webhook processed successfully' 
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Return error response
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook',
      details: error.message
    });
  }
}