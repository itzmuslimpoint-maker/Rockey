import { startRazorpayPayment } from './razorpay';
import { startDodoPayment } from './dodo';

interface PaymentOptions {
  country: string;
  plan: string;
  amount: number;
  email?: string;
  name?: string;
  onSuccess: () => void;
}

export const initiatePayment = async ({ country, plan, amount, email, name, onSuccess }: PaymentOptions) => {
  if (country === 'IN') {
    await startRazorpayPayment(plan, amount, onSuccess);
  } else {
    await startDodoPayment(plan, email, name);
  }
};
