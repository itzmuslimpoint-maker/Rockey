import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { getSupabase } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers["x-dodo-signature"] as string;
  const webhookKey = process.env.DODO_WEBHOOK_KEY;

  if (webhookKey && signature) {
    const hmac = crypto.createHmac("sha256", webhookKey);
    const computedSignature = hmac.update(JSON.stringify(req.body)).digest("hex");
    
    if (computedSignature !== signature) {
      return res.status(401).json({ error: "Invalid signature" });
    }
  }

  const { type, data } = req.body;
  const supabase = getSupabase();

  if (type === "checkout.succeeded" && supabase) {
    const { customer, product_cart } = data;
    const planId = product_cart[0].product_id;
    const email = customer.email;

    try {
      await supabase
        .from("users")
        .update({ 
          plan: planId,
          is_premium: true,
          updated_at: new Date().toISOString()
        })
        .eq("email", email);
    } catch (dbError) {
      console.error("Database Update Error:", dbError);
    }
  }

  res.status(200).json({ received: true });
}
