import {useStripe, usePaymentSheet} from '@stripe/stripe-react-native';
import {Alert} from 'react-native';
import {functionsService} from './firebase';
import {getStripePublishableKey, dollarsToCents, calculatePaymentAmount} from '@/config/stripe';
import {PaymentMethod, Order} from '@/types';
import {ERROR_MESSAGES, SUCCESS_MESSAGES} from '@/constants';

// Payment service for handling Stripe payments
export class PaymentService {
  private stripe;
  private paymentSheet;

  constructor() {
    const {stripe} = useStripe();
    const {initPaymentSheet, presentPaymentSheet} = usePaymentSheet();
    
    this.stripe = stripe;
    this.paymentSheet = {initPaymentSheet, presentPaymentSheet};
  }

  // Initialize payment sheet for checkout
  async initializePaymentSheet(order: Partial<Order>): Promise<boolean> {
    try {
      const {clientSecret, ephemeralKey, customer} = await this.createPaymentIntent(order);

      const {error} = await this.paymentSheet.initPaymentSheet({
        merchantDisplayName: 'FuelFlow',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: false,
        defaultBillingDetails: {
          name: order.userId, // Replace with actual user name
        },
        style: 'alwaysDark',
      });

      if (error) {
        console.error('Payment sheet initialization error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Payment initialization error:', error);
      return false;
    }
  }

  // Present payment sheet and process payment
  async processPayment(): Promise<{success: boolean; error?: string}> {
    try {
      const {error} = await this.paymentSheet.presentPaymentSheet();

      if (error) {
        if (error.code === 'Canceled') {
          return {success: false, error: 'Payment was canceled'};
        }
        return {success: false, error: error.message};
      }

      return {success: true};
    } catch (error: any) {
      return {success: false, error: error.message || ERROR_MESSAGES.GENERIC_ERROR};
    }
  }

  // Create payment intent via Firebase Cloud Function
  private async createPaymentIntent(order: Partial<Order>): Promise<{
    clientSecret: string;
    ephemeralKey: string;
    customer: string;
  }> {
    const paymentData = {
      amount: dollarsToCents(order.totalAmount || 0),
      currency: 'usd',
      userId: order.userId,
      orderId: order.orderId,
      metadata: {
        fuelType: order.fuelType,
        quantity: order.quantity?.toString(),
        deliveryAddress: JSON.stringify(order.deliveryAddress),
      },
    };

    const result = await functionsService.processPayment(paymentData);
    return result;
  }

  // Add payment method to customer
  async addPaymentMethod(userId: string): Promise<PaymentMethod | null> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not initialized');
      }

      const {error, paymentMethod} = await this.stripe.createPaymentMethod({
        paymentMethodType: 'Card',
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentMethod) {
        // Save payment method to Firebase via Cloud Function
        const result = await functionsService.callFunction('savePaymentMethod', {
          userId,
          paymentMethodId: paymentMethod.id,
        });

        return {
          paymentMethodId: paymentMethod.id,
          type: 'credit_card',
          last4: paymentMethod.card?.last4 || '',
          isDefault: result.isDefault || false,
        };
      }

      return null;
    } catch (error: any) {
      console.error('Add payment method error:', error);
      throw new Error(error.message || ERROR_MESSAGES.GENERIC_ERROR);
    }
  }

  // Remove payment method
  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await functionsService.callFunction('removePaymentMethod', {
        paymentMethodId,
      });
    } catch (error: any) {
      console.error('Remove payment method error:', error);
      throw new Error(error.message || ERROR_MESSAGES.GENERIC_ERROR);
    }
  }

  // Get saved payment methods for user
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const result = await functionsService.callFunction('getPaymentMethods', {
        userId,
      });
      
      return result.paymentMethods || [];
    } catch (error: any) {
      console.error('Get payment methods error:', error);
      return [];
    }
  }

  // Process refund for an order
  async processRefund(orderId: string, amount?: number): Promise<boolean> {
    try {
      await functionsService.callFunction('processRefund', {
        orderId,
        amount: amount ? dollarsToCents(amount) : undefined,
      });
      
      return true;
    } catch (error: any) {
      console.error('Refund processing error:', error);
      throw new Error(error.message || ERROR_MESSAGES.GENERIC_ERROR);
    }
  }
}

// Hook for using payment service
export const usePaymentService = () => {
  return new PaymentService();
};

// Utility functions for payment calculations
export const PaymentUtils = {
  calculateOrderTotal: calculatePaymentAmount,
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  },
  
  validatePaymentAmount: (amount: number): boolean => {
    return amount > 0 && amount <= 999999; // Max $9,999.99
  },
  
  getPaymentMethodIcon: (type: string): string => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return 'credit-card';
      case 'apple_pay':
        return 'apple';
      case 'google_pay':
        return 'google';
      default:
        return 'payment';
    }
  },
};

export default PaymentService;