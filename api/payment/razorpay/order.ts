import type { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, plan } = req.body;
  const key_id = process.env.RAZORPAY_KEY_ID || "";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "";

  if (!key_id || !key_secret) {
    return res.status(500).json({ error: "Razorpay is not configured on the server." });
  }

  try {
    const razorpay = new Razorpay({ key_id, key_secret });
    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { plan },
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error: any) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
}
