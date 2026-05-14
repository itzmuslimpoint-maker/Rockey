import express from "express";
import { createServer as createViteServer } from "vite";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import Razorpay from "razorpay";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { syncInstagramData } from "./api/_lib/instagram-sync";

dotenv.config();

console.log("Environment Variables Loaded:");
console.log("- INSTAGRAM_CLIENT_ID:", process.env.INSTAGRAM_CLIENT_ID ? "Set" : "Not Set");
console.log("- APP_URL:", process.env.APP_URL);

const app = express();

// Initialize Supabase Admin Client
const getSupabase = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase credentials missing - operations requiring DB will fail.");
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey);
};

// Lazy Razorpay initialization
let razorpayInstance: Razorpay | null = null;
const getRazorpay = () => {
  if (!razorpayInstance) {
    const key_id = process.env.RAZORPAY_KEY_ID || "";
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "";
    if (key_id && key_secret) {
      razorpayInstance = new Razorpay({ key_id, key_secret });
    }
  }
  return razorpayInstance;
};

async function startServer() {
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // CORS configuration
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      "https://dmflow.site",
      "https://www.dmflow.site",
      "https://ais-dev-uv4ciidriw33u37kmwk34e-10011470123.asia-east1.run.app", // Dev URL
      "http://localhost:3000"
    ];
    
    if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.run.app'))) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  console.log("--- Environment Configuration ---");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("APP_URL:", process.env.APP_URL || "Not Set (Using dynamic detection)");
  console.log("INSTAGRAM_CLIENT_ID:", process.env.INSTAGRAM_CLIENT_ID ? "Configured" : "Missing");
  console.log("---------------------------------");

  // Diagnostic endpoint for OAuth config
  app.get("/api/auth/instagram/debug", (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const detectedBaseUrl = `${protocol}://${host}`;
    
    res.json({
      clientId: process.env.INSTAGRAM_CLIENT_ID ? `${process.env.INSTAGRAM_CLIENT_ID.substring(0, 4)}...` : "Not Set",
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET ? "Set (Hidden)" : "Not Set",
      envAppUrl: process.env.APP_URL || "Not Set",
      detectedBaseUrl: detectedBaseUrl,
      redirectUri: `${process.env.APP_URL || detectedBaseUrl}/auth/instagram/callback`,
      nodeEnv: process.env.NODE_ENV
    });
  });

  if (process.env.NODE_ENV === "production" && !process.env.APP_URL) {
    console.warn("WARNING: APP_URL environment variable is missing. Instagram OAuth will not work correctly.");
  }

  const supabase = getSupabase();
  const isSupabaseConfigured = !!supabase;

  app.post("/api/instagram-exchange", async (req, res) => {
    const { code, userId } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    if (!isSupabaseConfigured) {
      console.warn("Supabase is not configured. Skipping database updates.");
      // We still need to set cookies for the session to work in demo mode
    }

    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
    
    // Production safe redirect URI
    let redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
    if (!redirectUri) {
      const baseUrl = (process.env.APP_URL || "").replace(/\/$/, "");
      redirectUri = `${baseUrl}/auth/instagram/callback`;
    }

    if (!clientId || !clientSecret) {
      console.error("INSTAGRAM_CLIENT_ID or INSTAGRAM_CLIENT_SECRET is missing from environment");
      return res.status(500).json({ error: "Instagram OAuth credentials are not configured on the server." });
    }

    try {
      console.log(`Exchanging code for user token using Facebook API for user: ${userId}`);
      const apiVersion = "v21.0";
      const tokenResponse = await fetch(`https://graph.facebook.com/${apiVersion}/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`);
      const userTokens = await tokenResponse.json();

      if (userTokens.error) {
        console.error("Token exchange error:", userTokens.error);
        throw new Error(userTokens.error.message || "Failed to exchange code");
      }

      const userAccessToken = userTokens.access_token;

      // 2. Get Facebook Pages
      console.log("Fetching Facebook Pages...");
      const pagesResponse = await fetch(`https://graph.facebook.com/${apiVersion}/me/accounts?access_token=${userAccessToken}`);
      const pagesData = await pagesResponse.json();

      if (!pagesData.data || pagesData.data.length === 0) {
        throw new Error("No Facebook Pages found linked to this account. Ensure you have an Instagram Business account linked to a Facebook Page.");
      }

      let igBusinessId = null;
      let pageAccessToken = null;
      let pageId = null;

      for (const page of pagesData.data) {
        const igCheckResponse = await fetch(`https://graph.facebook.com/${apiVersion}/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`);
        const igCheckData = await igCheckResponse.json();
        
        if (igCheckData.instagram_business_account) {
          igBusinessId = igCheckData.instagram_business_account.id;
          pageAccessToken = page.access_token;
          pageId = page.id;
          break;
        }
      }

      if (!igBusinessId) {
        throw new Error("BUSINESS_ACCOUNT_REQUIRED: No Instagram Business account found linked to your Facebook Pages. Please convert your account to a Professional (Business or Creator) account and ensure it is linked to a Facebook Page.");
      }

      // 3. Fetch Instagram Profile Data
      console.log("Fetching Instagram Profile Data...");
      const profileResponse = await fetch(`https://graph.facebook.com/${apiVersion}/${igBusinessId}?fields=username,followers_count,follows_count,profile_picture_url&access_token=${pageAccessToken}`);
      const profileData = await profileResponse.json();

      if (profileData.error) throw new Error(profileData.error.message);

      const igUser = {
        id: igBusinessId,
        username: profileData.username,
        profile_picture: profileData.profile_picture_url,
        followers: profileData.followers_count,
        following: profileData.follows_count,
        page_id: pageId
      };

      console.log("Instagram User Profile fetched:", JSON.stringify(igUser));

      // 4. Store tokens and user info in Supabase
      if (userId && supabase) {
        console.log(`Storing Instagram data for user: ${userId}`);
        
        try {
          await supabase
            .from("users")
            .update({
              instagram_connected: true,
              instagram_token: pageAccessToken,
              instagram_user_id: igUser.id
            })
            .eq("id", userId);

          await supabase
            .from("instagram_accounts")
            .upsert({
              user_id: String(userId),
              ig_user_id: igUser.id,
              username: igUser.username,
              profile_picture: igUser.profile_picture,
              followers: igUser.followers,
              following: igUser.following,
              access_token: pageAccessToken,
              page_id: pageId,
              connected_at: new Date().toISOString()
            }, { onConflict: 'ig_user_id' });

          // Trigger background sync
          syncInstagramData(String(userId), pageAccessToken, igUser.id, pageId).catch(err => {
            console.error("Background sync error in exchange:", err);
          });
        } catch (dbError) {
          console.error("Database storage error:", dbError);
        }
      }

      // Set Cookies
      res.cookie("ig_access_token", pageAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 60 * 24 * 60 * 60 * 1000 // 60 days
      });

      res.cookie("ig_user", JSON.stringify(igUser), {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 60 * 24 * 60 * 60 * 1000 // 60 days
      });

      res.json({ success: true, user: igUser });
    } catch (error: any) {
      console.error("Instagram exchange error:", error);
      res.status(500).json({ error: error.message || "Internal server error during exchange" });
    }
  });

  // Instagram/Facebook OAuth URL
  app.get("/api/auth/instagram/url", (req, res) => {
    const { userId } = req.query;
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const detectedBaseUrl = `${protocol}://${host}`;
    
    const clientId = process.env.INSTAGRAM_CLIENT_ID?.trim();
    
    // Production safe redirect URI
    let redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
    if (!redirectUri) {
      const baseUrl = (process.env.APP_URL || detectedBaseUrl).replace(/\/$/, "");
      redirectUri = `${baseUrl}/auth/instagram/callback`;
    }
    
    if (!clientId) {
      return res.status(400).json({ 
        error: "INSTAGRAM_CLIENT_ID is not configured. Please set it in your environment variables/secrets." 
      });
    }

    // Scopes for Meta OAuth (Instagram Business flow) as requested
    const scopes = [
      "instagram_basic",
      "instagram_manage_messages",
      "instagram_manage_comments",
      "pages_show_list",
      "pages_read_engagement"
    ].join(",");

    // Use 'state' to pass the SaaS userId through the OAuth flow
    const state = userId ? String(userId) : "";

    // Using the Facebook authorize endpoint (standard for Instagram Business API)
    const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=code&state=${state}`;
    
    console.log("Generated Facebook Auth URL:", authUrl);
    console.log("Redirect URI:", redirectUri);
    
    res.json({ url: authUrl });
  });

  // Specifically for the "Connect with Instagram" button (Instagram branded flow)
  app.get("/api/auth/instagram-direct/url", (req, res) => {
    const { userId } = req.query;
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const detectedBaseUrl = `${protocol}://${host}`;
    
    const clientId = process.env.INSTAGRAM_CLIENT_ID?.trim();
    
    let redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
    if (!redirectUri) {
       const baseUrl = (process.env.APP_URL || detectedBaseUrl).replace(/\/$/, "");
       redirectUri = `${baseUrl}/auth/instagram/callback`;
    }
    
    if (!clientId) {
      return res.status(400).json({ error: "INSTAGRAM_CLIENT_ID is not configured." });
    }

    const scopes = [
      "instagram_business_basic",
      "instagram_business_manage_messages",
      "instagram_business_manage_comments",
      "pages_show_list",
      "pages_read_engagement"
    ].join(",");

    const state = userId ? String(userId) : "";

    // Using the Instagram-branded authorize endpoint
    const authUrl = `https://www.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=code&state=${state}`;
    
    res.json({ url: authUrl });
  });

  // Instagram/Facebook OAuth Callback
  app.get("/auth/instagram/callback", async (req, res) => {
    const { code, state: userId, error, error_description } = req.query;

    console.log("OAuth Callback Hit:", { code: !!code, userId, error, error_description });

    if (error) {
      console.error("OAuth Error from Facebook:", error, error_description);
      return res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: '${error_description || error}' }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    }

    if (!code) {
      return res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: 'No code provided' }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    }

    try {
      const clientId = process.env.INSTAGRAM_CLIENT_ID;
      const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
      
      let redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
      if (!redirectUri) {
         const baseUrl = process.env.APP_URL?.replace(/\/$/, "");
         redirectUri = `${baseUrl}/auth/instagram/callback`;
      }

      const apiVersion = "v21.0";

      // 1. Exchange code for user access token
      console.log(`Exchanging code for user token using Facebook API...`);
      const tokenResponse = await fetch(`https://graph.facebook.com/${apiVersion}/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`);
      const userTokens = await tokenResponse.json();

      if (userTokens.error) {
        console.error("Token exchange error:", userTokens.error);
        throw new Error(userTokens.error.message || "Failed to exchange code");
      }

      const userAccessToken = userTokens.access_token;

      // 2. Get Facebook Pages (GET /me/accounts)
      console.log("Fetching Facebook Pages...");
      const pagesResponse = await fetch(`https://graph.facebook.com/${apiVersion}/me/accounts?access_token=${userAccessToken}`);
      const pagesData = await pagesResponse.json();

      if (!pagesData.data || pagesData.data.length === 0) {
        throw new Error("No Facebook Pages found linked to this account. Ensure you have an Instagram Business account linked to a Facebook Page.");
      }

      // For simplicity, we'll use the first page found that has an Instagram Business account
      // In a more complex app, we might ask the user to pick
      let igBusinessId = null;
      let pageAccessToken = null;
      let pageId = null;

      console.log("Searching for linked Instagram Business Account...");
      for (const page of pagesData.data) {
        const igCheckResponse = await fetch(`https://graph.facebook.com/${apiVersion}/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`);
        const igCheckData = await igCheckResponse.json();
        
        if (igCheckData.instagram_business_account) {
          igBusinessId = igCheckData.instagram_business_account.id;
          pageAccessToken = page.access_token;
          pageId = page.id;
          break;
        }
      }

      if (!igBusinessId) {
        throw new Error("BUSINESS_ACCOUNT_REQUIRED: No Instagram Business account found linked to your Facebook Pages. Please convert your account to a Professional (Business or Creator) account and ensure it is linked to a Facebook Page.");
      }

      // 3. Fetch Instagram Profile Data
      console.log("Fetching Instagram Profile Data...");
      const profileResponse = await fetch(`https://graph.facebook.com/${apiVersion}/${igBusinessId}?fields=username,followers_count,follows_count,profile_picture_url&access_token=${pageAccessToken}`);
      const profileData = await profileResponse.json();

      if (profileData.error) throw new Error(profileData.error.message);

      const igUser = {
        id: igBusinessId,
        username: profileData.username,
        profile_picture: profileData.profile_picture_url,
        followers: profileData.followers_count,
        following: profileData.follows_count,
        page_id: pageId
      };
      
      console.log("Instagram User Profile fetched:", JSON.stringify(igUser));

      // 4. Store tokens and user info in Supabase if userId is provided
      const supabase = getSupabase();
      if (userId && supabase) {
        console.log(`Storing Instagram data for user: ${userId}`);
        
        // Update users table
        await supabase
          .from("users")
          .update({
            instagram_connected: true,
            instagram_token: pageAccessToken, // We store the Page Access Token for messaging
            instagram_user_id: igUser.id
          })
          .eq("id", userId);

        // Upsert into instagram_accounts table
        await supabase
          .from("instagram_accounts")
          .upsert({
            user_id: String(userId),
            ig_user_id: igUser.id,
            username: igUser.username,
            profile_picture: igUser.profile_picture,
            followers: igUser.followers,
            following: igUser.following,
            access_token: pageAccessToken,
            connected_at: new Date().toISOString()
          }, { onConflict: 'ig_user_id' });

        // Trigger background sync
        syncInstagramData(String(userId), pageAccessToken, igUser.id, pageId).catch(err => {
          console.error("Background sync error in callback:", err);
        });
      }

      // 5. Set Cookies
      res.cookie("ig_access_token", pageAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 60 * 24 * 60 * 60 * 1000 // 60 days
      });

      res.cookie("ig_user", JSON.stringify(igUser), {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 60 * 24 * 60 * 60 * 1000 // 60 days
      });

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("OAuth Error:", error);
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: '${error.message.replace(/'/g, "\\'")}' }, '*');
                window.close();
              } else {
                window.location.href = '/?error=${encodeURIComponent(error.message)}';
              }
            </script>
            <p>Authentication failed: ${error.message}</p>
          </body>
        </html>
      `);
    }
  });

  // Profile Fetch API
  app.get("/api/instagram/profile", async (req, res) => {
    try {
      const { userId } = req.query;
      const igUserCookie = req.cookies.ig_user;
      
      const supabase = getSupabase();
      
      if (userId && supabase) {
        const { data, error } = await supabase
          .from("instagram_accounts")
          .select("username")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) throw error;
        if (data?.username) {
          return res.json({ username: data.username });
        }
      }

      if (igUserCookie) {
        try {
          const igUser = JSON.parse(igUserCookie);
          if (igUser.username) {
            return res.json({ username: igUser.username });
          }
        } catch (e) {
          console.error("Cookie parse error:", e);
        }
      }
      
      return res.json({ username: null });
    } catch (error: any) {
      console.error("Error fetching IG profile API:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/instagram/disconnect", async (req, res) => {
    const { userId } = req.body;
    const supabase = getSupabase();
    
    if (userId && supabase) {
      try {
        const { error } = await supabase
          .from("users")
          .update({
            instagram_connected: false,
            instagram_token: null,
            instagram_user_id: null
          })
          .eq("id", userId);
        
        if (error) throw error;
      } catch (err) {
        console.error("Disconnect error:", err);
        // Continue clearing cookies anyway
      }
    }

    res.clearCookie("ig_access_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    res.clearCookie("ig_user", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    res.json({ success: true });
  });

  app.get("/api/auth/instagram/token", (req, res) => {
    const token = req.cookies.ig_access_token;
    if (!token) {
      return res.status(404).json({ error: "No token found" });
    }
    res.json({ token });
  });

  app.get("/api/auth/instagram/profile", (req, res) => {
    const igUser = req.cookies.ig_user;
    if (!igUser) {
      return res.status(404).json({ error: "No Instagram user found" });
    }
    try {
      res.json(JSON.parse(igUser));
    } catch (e) {
      res.status(500).json({ error: "Failed to parse user profile" });
    }
  });

  app.get("/api/instagram/profile", (req, res) => {
    const igUserCookie = req.cookies.ig_user;
    
    if (!igUserCookie) {
      return res.status(404).json({ username: null });
    }

    try {
      const igUser = JSON.parse(igUserCookie);
      return res.status(200).json({ username: igUser.username });
    } catch (error) {
      console.error("Error parsing ig_user cookie:", error);
      return res.status(500).json({ username: null });
    }
  });

  app.get("/api/auth/status", (req, res) => {
    const igToken = req.cookies.ig_access_token;
    // We consider logged in if they have an IG token or if they are logged in via Supabase (handled client-side)
    // But this endpoint specifically checks for the server-side session
    res.json({ loggedIn: !!igToken });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("ig_access_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    res.clearCookie("ig_user", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    res.json({ success: true });
  });

  // --- Geo-Detection ---
  app.get("/api/geo", (req, res) => {
    // Vercel provides country in headers
    const country = req.headers["x-vercel-ip-country"] || "US";
    res.json({ country });
  });

  // --- Payment Routes (Razorpay) ---
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
  });

  // Serve static files from public folder explicitly for sitemap and robots
  app.get("/sitemap.xml", (req, res) => {
    res.set("Content-Type", "application/xml");
    res.sendFile(path.join(process.cwd(), "public", "sitemap.xml"));
  });

  app.get("/robots.txt", (req, res) => {
    res.set("Content-Type", "text/plain");
    res.sendFile(path.join(process.cwd(), "public", "robots.txt"));
  });

  app.post("/api/payment/razorpay/order", async (req, res) => {
    const { amount, plan } = req.body;
    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(500).json({ error: "Razorpay is not configured." });
    }
    try {
      const options = {
        amount: amount * 100, // amount in the smallest currency unit (paise for INR)
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: { plan },
      };
      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error) {
      console.error("Razorpay Order Error:", error);
      res.status(500).json({ error: "Failed to create Razorpay order" });
    }
  });

  app.post("/api/payment/razorpay/verify", async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(500).json({ error: "Razorpay is not configured." });
    }
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Payment is successful
      // In a real app, update user subscription in DB here
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: "Invalid signature" });
    }
  });

  // --- Payment Routes (Dodo Payments) ---
  app.post("/api/payment/dodo/create", async (req, res) => {
    const { plan, email, name } = req.body;
    
    if (!process.env.DODO_PAYMENTS_API_KEY) {
      console.error("DODO_PAYMENTS_API_KEY is missing");
      return res.status(500).json({ error: "Dodo Payments API key is not configured." });
    }

    // Map plan names to Dodo product IDs (these would be your real IDs from Dodo dashboard)
    const planToProductId: Record<string, string> = {
      "Creator": process.env.DODO_PRODUCT_ID_CREATOR || "prod_creator_123",
      "Pro": process.env.DODO_PRODUCT_ID_PRO || "prod_pro_456"
    };

    const productId = planToProductId[plan];
    if (!productId) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    try {
      const baseUrl = (process.env.APP_URL || "").replace(/\/$/, "");
      const returnUrl = `${baseUrl}/checkout/success`;

      const response = await fetch("https://test.dodopayments.com/v1/checkouts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
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
        console.error("Dodo API Error:", session);
        throw new Error(session.message || `Dodo API error: ${response.status}`);
      }

      res.json({ checkout_url: session.checkout_url });
    } catch (error: any) {
      console.error("Dodo Create Error:", error);
      res.status(500).json({ error: error.message || "Failed to create Dodo checkout session" });
    }
  });

  // Dodo Webhook Handler
  app.post("/api/webhooks/dodo", async (req, res) => {
    const signature = req.headers["x-dodo-signature"];
    const webhookKey = process.env.DODO_WEBHOOK_KEY;

    if (webhookKey && signature) {
      const hmac = crypto.createHmac("sha256", webhookKey);
      const computedSignature = hmac.update(JSON.stringify(req.body)).digest("hex");
      
      if (computedSignature !== signature) {
        console.warn("Invalid Dodo webhook signature");
        return res.status(401).json({ error: "Invalid signature" });
      }
    }

    console.log("Dodo Webhook received:", req.body);

    const { type, data } = req.body;
    const supabase = getSupabase();

    if (type === "checkout.succeeded" && supabase) {
      const { customer, product_cart } = data;
      const planId = product_cart[0].product_id;
      const email = customer.email;

      console.log(`Payment successful for ${email}. Plan: ${planId}`);
      
      try {
        // Update user status in Supabase
        // We search by email and update the plan/is_premium status
        const { error } = await supabase
          .from("users")
          .update({ 
            plan: planId,
            is_premium: true,
            updated_at: new Date().toISOString()
          })
          .eq("email", email);

        if (error) throw error;
        console.log(`Successfully updated premium status for ${email}`);
      } catch (dbError) {
        console.error("Database Update Error:", dbError);
        // We still return 200 to Dodo to acknowledge receipt, but log the error
      }
    }

    res.json({ received: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

export default app;
