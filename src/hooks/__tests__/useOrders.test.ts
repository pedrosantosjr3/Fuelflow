import {renderHook, act} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from 'react-query';
import React from 'react';
import {useOrders} from '../useOrders';
import {orderService} from '@/services/firebase';
import {FuelType, OrderStatus} from '@/types';

// Mock Firebase services
jest.mock('@/services/firebase', () => ({
  orderService: {
    getUserOrders: jest.fn(),
    createOrder: jest.fn(),
    updateOrder: jest.fn(),
    cancelOrder: jest.fn(),
    getOrder: jest.fn(),
    onOrderChanged: jest.fn(),
  },
}));

const mockOrderService = orderService as jest.Mocked<typeof orderService>;

// Create a wrapper component for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({children}: {children: React.ReactNode}) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const mockOrder = {
  orderId: 'order123',
  userId: 'user123',
  status: OrderStatus.PENDING,
  fuelType: FuelType.REGULAR,
  quantity: 15,
  pricePerGallon: 4.0,
  deliveryFee: 4.99,
  tax: 3.2,
  totalAmount: 63.19,
  deliveryAddress: {
    addressId: 'addr123',
    label: 'Home',
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    coordinates: {latitude: 40.7128, longitude: -74.0060},
    isDefault: true,
  },
  vehicle: {
    vehicleId: 'vehicle123',
    make: 'Honda',
    model: 'Civic',
    year: 2020,
    fuelType: FuelType.REGULAR,
    tankCapacity: 15,
    isDefault: true,
  },
  scheduledTime: new Date(),
  paymentMethodId: 'payment123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('useOrders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch user orders', async () => {
    const mockOrders = [mockOrder];
    mockOrderService.getUserOrders.mockResolvedValue(mockOrders);

    const {result} = renderHook(() => useOrders('user123'), {
      wrapper: createWrapper(),
    });

    // Wait for the query to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockOrderService.getUserOrders).toHaveBeenCalledWith('user123');
    expect(result.current.orders).toEqual(mockOrders);
    expect(result.current.loading).toBe(false);
  });

  it('should create a new order', async () => {
    mockOrderService.createOrder.mockResolvedValue('order123');
    mockOrderService.getUserOrders.mockResolvedValue([]);

    const {result} = renderHook(() => useOrders('user123'), {
      wrapper: createWrapper(),
    });

    const orderForm = {
      fuelType: FuelType.REGULAR,
      quantity: 15,
      addressId: 'addr123',
      vehicleId: 'vehicle123',
      scheduledTime: new Date(),
    };

    await act(async () => {
      await result.current.createOrder(orderForm);
    });

    expect(mockOrderService.createOrder).toHaveBeenCalled();
    expect(result.current.error).toBe(null);
  });

  it('should handle create order error', async () => {
    const errorMessage = 'Failed to create order';
    mockOrderService.createOrder.mockRejectedValue(new Error(errorMessage));
    mockOrderService.getUserOrders.mockResolvedValue([]);

    const {result} = renderHook(() => useOrders('user123'), {
      wrapper: createWrapper(),
    });

    const orderForm = {
      fuelType: FuelType.REGULAR,
      quantity: 15,
      addressId: 'addr123',
      vehicleId: 'vehicle123',
      scheduledTime: new Date(),
    };

    await act(async () => {
      try {
        await result.current.createOrder(orderForm);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('should get a specific order', async () => {
    mockOrderService.getOrder.mockResolvedValue(mockOrder);
    mockOrderService.getUserOrders.mockResolvedValue([]);

    const {result} = renderHook(() => useOrders('user123'), {
      wrapper: createWrapper(),
    });

    let retrievedOrder;
    await act(async () => {
      retrievedOrder = await result.current.getOrder('order123');
    });

    expect(mockOrderService.getOrder).toHaveBeenCalledWith('order123');
    expect(retrievedOrder).toEqual(mockOrder);
  });

  it('should cancel an order', async () => {
    mockOrderService.cancelOrder.mockResolvedValue(undefined);
    mockOrderService.getUserOrders.mockResolvedValue([]);

    const {result} = renderHook(() => useOrders('user123'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.cancelOrder('order123');
    });

    expect(mockOrderService.cancelOrder).toHaveBeenCalledWith('order123');
    expect(result.current.error).toBe(null);
  });

  it('should track an order', async () => {
    mockOrderService.getOrder.mockResolvedValue(mockOrder);
    mockOrderService.getUserOrders.mockResolvedValue([]);

    const {result} = renderHook(() => useOrders('user123'), {
      wrapper: createWrapper(),
    });

    let trackedOrder;
    await act(async () => {
      trackedOrder = await result.current.trackOrder('order123');
    });

    expect(mockOrderService.getOrder).toHaveBeenCalledWith('order123');
    expect(trackedOrder).toEqual(mockOrder);
  });

  it('should handle errors when user is not provided', async () => {
    const {result} = renderHook(() => useOrders(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.createOrder({
          fuelType: FuelType.REGULAR,
          quantity: 15,
          addressId: 'addr123',
          vehicleId: 'vehicle123',
          scheduledTime: new Date(),
        });
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('User not authenticated');
  });

  it('should not fetch orders when userId is not provided', async () => {
    const {result} = renderHook(() => useOrders(), {
      wrapper: createWrapper(),
    });

    expect(mockOrderService.getUserOrders).not.toHaveBeenCalled();
    expect(result.current.orders).toEqual([]);
  });
});