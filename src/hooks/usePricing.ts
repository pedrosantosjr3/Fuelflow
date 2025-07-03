import {useState, useCallback} from 'react';
import {useQuery} from 'react-query';
import {priceComparisonService, gasStationService, functionsService} from '@/services/firebase';
import {PriceComparison, GasStation, FuelType} from '@/types';
import {ERROR_MESSAGES} from '@/constants';

interface PricingData {
  ourPrice: number;
  marketAverage: number;
  nearbyStations: Array<{
    stationId: string;
    name: string;
    price: number;
    distance: number;
  }>;
  savings: {
    perGallon: number;
    percentage: number;
    totalSavings: number;
  };
}

export const usePricing = () => {
  const [error, setError] = useState<string | null>(null);

  // Get fuel prices for a location
  const getFuelPrices = useCallback(async (
    zipCode: string,
    fuelType: FuelType,
    quantity: number = 15
  ): Promise<PricingData | null> => {
    try {
      setError(null);

      // First, try to get cached price comparison
      let priceComparison = await priceComparisonService.getPriceComparison(zipCode, fuelType);

      // If no recent data, fetch fresh prices
      if (!priceComparison || isDataStale(priceComparison.createdAt)) {
        const freshPrices = await functionsService.getFuelPrices(zipCode);
        
        if (freshPrices) {
          // Create new price comparison
          const comparisonData = {
            zipCode,
            fuelType,
            ourPrice: freshPrices.ourPrice,
            marketAverage: freshPrices.marketAverage,
            nearbyStations: freshPrices.nearbyStations,
            savings: {
              perGallon: Math.max(0, freshPrices.marketAverage - freshPrices.ourPrice),
              percentage: freshPrices.marketAverage > 0 
                ? ((freshPrices.marketAverage - freshPrices.ourPrice) / freshPrices.marketAverage) * 100 
                : 0,
            },
          };

          await priceComparisonService.createPriceComparison(comparisonData);
          priceComparison = comparisonData;
        }
      }

      if (!priceComparison) {
        return null;
      }

      // Calculate total savings for the requested quantity
      const totalSavings = priceComparison.savings.perGallon * quantity;

      return {
        ourPrice: priceComparison.ourPrice,
        marketAverage: priceComparison.marketAverage,
        nearbyStations: priceComparison.nearbyStations,
        savings: {
          perGallon: priceComparison.savings.perGallon,
          percentage: priceComparison.savings.percentage,
          totalSavings,
        },
      };
    } catch (err: any) {
      setError(err.message || ERROR_MESSAGES.GENERIC_ERROR);
      return null;
    }
  }, []);

  // Get nearby gas stations with prices
  const getNearbyStations = useCallback(async (
    latitude: number,
    longitude: number,
    radius: number = 10
  ): Promise<GasStation[]> => {
    try {
      setError(null);
      const stations = await gasStationService.getNearbyStations(latitude, longitude, radius * 1000); // Convert to meters
      return stations;
    } catch (err: any) {
      setError(err.message || ERROR_MESSAGES.GENERIC_ERROR);
      return [];
    }
  }, []);

  // Calculate delivery cost
  const calculateDeliveryFee = useCallback(async (
    deliveryAddress: {latitude: number; longitude: number}
  ): Promise<number> => {
    try {
      setError(null);
      const result = await functionsService.calculateDeliveryFee(deliveryAddress);
      return result.deliveryFee || 4.99; // Default delivery fee
    } catch (err: any) {
      setError(err.message || ERROR_MESSAGES.GENERIC_ERROR);
      return 4.99; // Default delivery fee on error
    }
  }, []);

  // Check if price data is stale (older than 4 hours)
  const isDataStale = (createdAt: Date): boolean => {
    const now = new Date();
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    return new Date(createdAt) < fourHoursAgo;
  };

  return {
    getFuelPrices,
    getNearbyStations,
    calculateDeliveryFee,
    error,
  };
};

// Hook for real-time price tracking for a specific location
export const usePriceTracking = (zipCode: string, fuelType: FuelType) => {
  const {getFuelPrices, error} = usePricing();

  const {
    data: pricingData,
    isLoading: loading,
    refetch,
  } = useQuery(
    ['pricing', zipCode, fuelType],
    () => getFuelPrices(zipCode, fuelType),
    {
      enabled: !!zipCode && !!fuelType,
      staleTime: 15 * 60 * 1000, // 15 minutes
      refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
      retry: 2,
    }
  );

  return {
    pricingData,
    loading,
    error,
    refetchPrices: refetch,
  };
};

// Hook for price comparison widget
export const usePriceComparison = () => {
  const [savedComparisons, setSavedComparisons] = useState<PriceComparison[]>([]);
  const {getFuelPrices, error} = usePricing();

  const addComparison = useCallback(async (
    zipCode: string,
    fuelType: FuelType,
    quantity: number = 15
  ) => {
    const pricingData = await getFuelPrices(zipCode, fuelType, quantity);
    
    if (pricingData) {
      const comparison: PriceComparison = {
        comparisonId: `comp_${Date.now()}`,
        zipCode,
        fuelType,
        ourPrice: pricingData.ourPrice,
        marketAverage: pricingData.marketAverage,
        nearbyStations: pricingData.nearbyStations,
        savings: {
          perGallon: pricingData.savings.perGallon,
          percentage: pricingData.savings.percentage,
        },
        createdAt: new Date(),
      };

      setSavedComparisons(prev => [comparison, ...prev.slice(0, 4)]); // Keep last 5 comparisons
      return comparison;
    }

    return null;
  }, [getFuelPrices]);

  const removeComparison = useCallback((comparisonId: string) => {
    setSavedComparisons(prev => prev.filter(comp => comp.comparisonId !== comparisonId));
  }, []);

  const clearComparisons = useCallback(() => {
    setSavedComparisons([]);
  }, []);

  return {
    savedComparisons,
    addComparison,
    removeComparison,
    clearComparisons,
    error,
  };
};

// Utility functions for pricing
export const PricingUtils = {
  formatPrice: (price: number): string => {
    return `$${price.toFixed(2)}`;
  },

  formatSavings: (savings: number): string => {
    if (savings <= 0) return '$0.00';
    return `$${savings.toFixed(2)}`;
  },

  formatPercentage: (percentage: number): string => {
    if (percentage <= 0) return '0%';
    return `${percentage.toFixed(1)}%`;
  },

  calculateMonthlySavings: (orders: any[], currentMonth: Date): number => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    return orders
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= monthStart && orderDate <= monthEnd && order.status === 'delivered';
      })
      .reduce((total, order) => {
        // Assuming savings data is stored in order
        return total + (order.savings || 0);
      }, 0);
  },

  calculateYearlySavings: (orders: any[], year: number): number => {
    return orders
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getFullYear() === year && order.status === 'delivered';
      })
      .reduce((total, order) => {
        return total + (order.savings || 0);
      }, 0);
  },

  getSavingsInsights: (pricingData: PricingData): {
    recommendation: string;
    insight: string;
    color: string;
  } => {
    const {savings} = pricingData;

    if (savings.percentage >= 10) {
      return {
        recommendation: 'Excellent Deal!',
        insight: `You're saving ${PricingUtils.formatPercentage(savings.percentage)} compared to nearby stations`,
        color: '#10B981', // Success green
      };
    } else if (savings.percentage >= 5) {
      return {
        recommendation: 'Good Savings',
        insight: `Save ${PricingUtils.formatSavings(savings.perGallon)} per gallon`,
        color: '#F97316', // Fuel orange
      };
    } else if (savings.percentage > 0) {
      return {
        recommendation: 'Minor Savings',
        insight: `Small savings of ${PricingUtils.formatSavings(savings.perGallon)} per gallon`,
        color: '#F59E0B', // Warning amber
      };
    } else {
      return {
        recommendation: 'Market Price',
        insight: 'Competitive with local stations',
        color: '#64748B', // Medium gray
      };
    }
  },
};