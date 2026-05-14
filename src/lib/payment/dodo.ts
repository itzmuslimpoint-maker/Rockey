import axios from 'axios';

export const startDodoPayment = async (plan: string, email?: string, name?: string) => {
  try {
    const { data } = await axios.post('/api/payment/dodo/create', {
      plan,
      email,
      name
    });

    if (data.checkout_url) {
      window.location.href = data.checkout_url;
    } else {
      throw new Error('No checkout URL received');
    }
  } catch (error: any) {
    console.error('Dodo Payment Error:', error);
    throw new Error(error.response?.data?.error || 'Failed to initiate Dodo payment');
  }
};
