import axios from 'axios';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const startRazorpayPayment = async (plan: string, amount: number, onSuccess: () => void) => {
  const res = await loadRazorpay();

  if (!res) {
    alert('Razorpay SDK failed to load. Are you online?');
    return;
  }

  // Create order on backend
  const { data } = await axios.post('/api/payment/razorpay/order', {
    amount,
    plan,
  });

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: data.amount,
    currency: data.currency,
    name: "DMflow",
    description: `Upgrade to ${plan} Plan`,
    order_id: data.id,
    handler: async function (response: any) {
      // Verify payment on backend
      const verifyRes = await axios.post('/api/payment/razorpay/verify', {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        plan,
      });

      if (verifyRes.data.success) {
        onSuccess();
      } else {
        alert('Payment verification failed');
      }
    },
    prefill: {
      name: "",
      email: "",
      contact: "",
    },
    theme: {
      color: "#84FF00",
    },
  };

  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};
