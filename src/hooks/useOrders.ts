import {useState, useEffect, useCallback} from 'react';
import {useQuery, useMutation, useQueryClient} from 'react-query';
import {orderService} from '@/services/firebase';
import {Order, OrderForm, OrderStatus, UseOrdersReturn} from '@/types';
import {ERROR_MESSAGES, SUCCESS_MESSAGES} from '@/constants';

export const useOrders = (userId?: string): UseOrdersReturn => {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch user orders
  const {
    data: orders = [],
    isLoading: loading,
    error: queryError,
  } = useQuery(
    ['orders', userId],
    () => (userId ? orderService.getUserOrders(userId) : Promise.resolve([])),
    {
      enabled: !!userId,
      staleTime: 30000, // 30 seconds
      refetchInterval: 60000, // Refetch every minute for active orders
    }
  );

  // Create order mutation
  const createOrderMutation = useMutation(
    (orderData: Omit<Order, 'orderId' | 'createdAt' | 'updatedAt'>) =>
      orderService.createOrder(orderData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['orders', userId]);
        setError(null);
      },
      onError: (err: any) => {
        setError(err.message || ERROR_MESSAGES.GENERIC_ERROR);
      },
    }
  );

  // Update order mutation
  const updateOrderMutation = useMutation(
    ({orderId, orderData}: {orderId: string; orderData: Partial<Order>}) =>
      orderService.updateOrder(orderId, orderData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['orders', userId]);
        setError(null);
      },
      onError: (err: any) => {
        setError(err.message || ERROR_MESSAGES.GENERIC_ERROR);
      },
    }
  );

  // Cancel order mutation
  const cancelOrderMutation = useMutation(
    (orderId: string) => orderService.cancelOrder(orderId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['orders', userId]);
        setError(null);
      },
      onError: (err: any) => {
        setError(err.message || ERROR_MESSAGES.GENERIC_ERROR);
      },
    }
  );

  // Create order function
  const createOrder = useCallback(async (orderData: OrderForm): Promise<Order> => {
    try {
      setError(null);
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Calculate total amount
      const subtotal = orderData.quantity * 4.0; // Example price calculation
      const deliveryFee = 4.99;
      const tax = (subtotal + deliveryFee) * 0.08;
      const totalAmount = subtotal + deliveryFee + tax;

      const fullOrderData: Omit<Order, 'orderId' | 'createdAt' | 'updatedAt'> = {
        userId,
        status: OrderStatus.PENDING,
        fuelType: orderData.fuelType,
        quantity: orderData.quantity,
        pricePerGallon: 4.0, // This should come from pricing service
        deliveryFee,
        tax,
        totalAmount,
        deliveryAddress: {
          addressId: orderData.addressId,
          label: 'Selected Address',
          street: '', // This should be populated from address data
          city: '',
          state: '',
          zipCode: '',
          coordinates: {latitude: 0, longitude: 0},
          isDefault: false,
        },
        vehicle: {
          vehicleId: orderData.vehicleId,
          make: '', // This should be populated from vehicle data
          model: '',
          year: 2020,
          fuelType: orderData.fuelType,
          tankCapacity: 15,
          isDefault: false,
        },
        scheduledTime: orderData.scheduledTime,
        specialInstructions: orderData.specialInstructions,
        paymentMethodId: 'default', // This should come from user's default payment method
      };

      const orderId = await createOrderMutation.mutateAsync(fullOrderData);
      
      // Return the created order
      const createdOrder: Order = {
        orderId,
        ...fullOrderData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return createdOrder;
    } catch (err: any) {
      setError(err.message || ERROR_MESSAGES.GENERIC_ERROR);
      throw err;
    }
  }, [userId, createOrderMutation]);

  // Get specific order
  const getOrder = useCallback(async (orderId: string): Promise<Order> => {
    try {
      setError(null);
      const order = await orderService.getOrder(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      return order;
    } catch (err: any) {
      setError(err.message || ERROR_MESSAGES.GENERIC_ERROR);
      throw err;
    }
  }, []);

  // Cancel order function
  const cancelOrder = useCallback(async (orderId: string): Promise<void> => {
    try {
      setError(null);
      await cancelOrderMutation.mutateAsync(orderId);
    } catch (err: any) {
      setError(err.message || ERROR_MESSAGES.GENERIC_ERROR);
      throw err;
    }
  }, [cancelOrderMutation]);

  // Track order function
  const trackOrder = useCallback(async (orderId: string): Promise<Order> => {
    try {
      setError(null);
      const order = await orderService.getOrder(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      return order;
    } catch (err: any) {
      setError(err.message || ERROR_MESSAGES.GENERIC_ERROR);
      throw err;
    }
  }, []);

  // Set up real-time order updates
  useEffect(() => {
    if (!userId) return;

    const activeOrders = orders.filter(order => 
      order.status === OrderStatus.PENDING || 
      order.status === OrderStatus.CONFIRMED || 
      order.status === OrderStatus.EN_ROUTE
    );

    const unsubscribeFunctions: Array<() => void> = [];

    activeOrders.forEach(order => {
      const unsubscribe = orderService.onOrderChanged(order.orderId, (updatedOrder) => {
        if (updatedOrder) {
          queryClient.setQueryData(['orders', userId], (oldOrders: Order[] | undefined) => {
            if (!oldOrders) return [updatedOrder];
            
            const index = oldOrders.findIndex(o => o.orderId === updatedOrder.orderId);
            if (index >= 0) {
              const newOrders = [...oldOrders];
              newOrders[index] = updatedOrder;
              return newOrders;
            }
            
            return oldOrders;
          });
        }
      });
      
      unsubscribeFunctions.push(unsubscribe);
    });

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [userId, orders, queryClient]);

  return {
    orders,
    loading: loading || createOrderMutation.isLoading || updateOrderMutation.isLoading,
    error: error || queryError?.message || null,
    createOrder,
    getOrder,
    cancelOrder,
    trackOrder,
  };
};

// Hook for getting active orders
export const useActiveOrders = (userId?: string) => {
  const {orders, ...rest} = useOrders(userId);
  
  const activeOrders = orders.filter(order => 
    order.status === OrderStatus.PENDING || 
    order.status === OrderStatus.CONFIRMED || 
    order.status === OrderStatus.EN_ROUTE
  );

  return {
    orders: activeOrders,
    ...rest,
  };
};

// Hook for getting order history
export const useOrderHistory = (userId?: string) => {
  const {orders, ...rest} = useOrders(userId);
  
  const orderHistory = orders.filter(order => 
    order.status === OrderStatus.DELIVERED || 
    order.status === OrderStatus.CANCELLED
  );

  return {
    orders: orderHistory,
    ...rest,
  };
};