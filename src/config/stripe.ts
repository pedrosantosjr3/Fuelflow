// Stripe configuration
export const STRIPE_CONFIG = {
  // Publishable keys (safe to expose in client)
  PUBLISHABLE_KEY: {
    development: process.env.STRIPE_PUBLISHABLE_KEY_DEV || 'pk_test_your_dev_key_here',
    production: process.env.STRIPE_PUBLISHABLE_KEY_PROD || 'pk_live_your_prod_key_here',
  },
  
  // API configuration
  API_VERSION: '2022-11-15' as const,
  
  // Payment method types
  PAYMENT_METHODS: [
    'card',
    'apple_pay',
    'google_pay',
  ] as const,
  
  // Currency settings
  CURRENCY: 'usd',
  
  // Card collection settings
  CARD_ELEMENT_OPTIONS: {
    style: {
      base: {
        fontSize: '16px',
        fontFamily: 'System',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  },
};

// Get the appropriate publishable key based on environment
export const getStripePublishableKey = (): string => {
  if (__DEV__) {
    return STRIPE_CONFIG.PUBLISHABLE_KEY.development;
  }
  return STRIPE_CONFIG.PUBLISHABLE_KEY.production;
};

// Payment amount calculation helpers
export const calculatePaymentAmount = (
  pricePerGallon: number,
  quantity: number,
  deliveryFee: number,
  taxRate: number = 0.08
): {
  subtotal: number;
  delivery: number;
  tax: number;
  total: number;
} => {
  const subtotal = pricePerGallon * quantity;
  const delivery = deliveryFee;
  const tax = (subtotal + delivery) * taxRate;
  const total = subtotal + delivery + tax;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    delivery: Math.round(delivery * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};

// Convert dollars to cents for Stripe
export const dollarsToCents = (dollars: number): number => {
  return Math.round(dollars * 100);
};

// Convert cents to dollars for display
export const centsToDollars = (cents: number): number => {
  return cents / 100;
};

export default STRIPE_CONFIG;