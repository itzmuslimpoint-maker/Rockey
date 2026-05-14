import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan, email, name } = req.body;
  
  const apiKey = process.env.DODO_PAYMENTS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Dodo Payments API key is not configured." });
  }

  const planToProductId: Record<string, string> = {
    "Creator": process.env.DODO_PRODUCT_ID_CREATOR || "prod_creator_123",
    "Pro": process.env.DODO_PRODUCT_ID_PRO || "prod_pro_456"
  };

  const productId = planToProductId[plan];
  if (!productId) {
    return res.status(400).json({ error: "Invalid plan" });
  }

  try {
    const baseUrl = process.env.APP_URL || `https://${req.headers.host}`;
    const returnUrl = `${baseUrl.replace(/\/$/, "")}/checkout/success`;

    const response = await fetch("https://test.dodopayments.com/v1/checkouts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        product_cart: [
          {
            product_id: productId,
            quantity: 1
          }
        ],
        customer: {
          email: email || "customer@example.com",
          name: name || "Customer"
        },
        return_url: returnUrl
      })
    });

    const session = await response.json();
    
    if (!response.ok) {
      throw new Error(session.message || `Dodo API error: ${response.status}`);
    }

    res.json({ checkout_url: session.checkout_url });
  } catch (error: any) {
    console.error("Dodo Create Error:", error);
    res.status(500).json({ error: error.message || "Failed to create Dodo checkout session" });
  }
}
