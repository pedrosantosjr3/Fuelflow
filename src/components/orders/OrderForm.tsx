import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import {Card, Button, TextInput, Chip, SegmentedButtons} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {useAuth} from '@/hooks/useAuth';
import {useOrders} from '@/hooks/useOrders';
import {usePricing} from '@/hooks/usePricing';
import {FuelType, OrderForm as OrderFormType, Address, Vehicle} from '@/types';
import {COLORS, TYPOGRAPHY, SPACING, FUEL_TYPES, BUSINESS_RULES} from '@/constants';

interface OrderFormProps {
  onOrderComplete?: (orderId: string) => void;
  onCancel?: () => void;
  initialAddress?: Address;
  initialVehicle?: Vehicle;
}

const OrderForm: React.FC<OrderFormProps> = ({
  onOrderComplete,
  onCancel,
  initialAddress,
  initialVehicle,
}) => {
  const {user} = useAuth();
  const {createOrder, loading: orderLoading} = useOrders(user?.userId);
  const {getFuelPrices, calculateDeliveryFee} = usePricing();

  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(initialAddress || null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(initialVehicle || null);
  const [pricingData, setPricingData] = useState<any>(null);
  const [deliveryFee, setDeliveryFee] = useState(BUSINESS_RULES.DELIVERY_FEE);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: {errors},
    watch,
    setValue,
  } = useForm<OrderFormType>({
    defaultValues: {
      fuelType: FuelType.REGULAR,
      quantity: 15,
      addressId: initialAddress?.addressId || '',
      vehicleId: initialVehicle?.vehicleId || '',
      scheduledTime: new Date(),
      specialInstructions: '',
    },
  });

  const watchedValues = watch();
  const {fuelType, quantity} = watchedValues;

  // Load user's addresses and vehicles
  const addresses = user?.addresses || [];
  const vehicles = user?.vehicles || [];

  // Update pricing when fuel type, quantity, or address changes
  useEffect(() => {
    if (selectedAddress && fuelType && quantity) {
      loadPricing();
    }
  }, [selectedAddress, fuelType, quantity]);

  // Update delivery fee when address changes
  useEffect(() => {
    if (selectedAddress) {
      loadDeliveryFee();
    }
  }, [selectedAddress]);

  const loadPricing = async () => {
    if (!selectedAddress) return;

    try {
      setLoading(true);
      const pricing = await getFuelPrices(selectedAddress.zipCode, fuelType, quantity);
      setPricingData(pricing);
    } catch (error) {
      console.error('Error loading pricing:', error);
      Alert.alert('Error', 'Unable to load current fuel prices');
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveryFee = async () => {
    if (!selectedAddress) return;

    try {
      const fee = await calculateDeliveryFee(selectedAddress.coordinates);
      setDeliveryFee(fee);
    } catch (error) {
      console.error('Error calculating delivery fee:', error);
    }
  };

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    setValue('addressId', address.addressId);
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setValue('vehicleId', vehicle.vehicleId);
    // Auto-select compatible fuel type
    setValue('fuelType', vehicle.fuelType);
  };

  const onSubmit = async (data: OrderFormType) => {
    try {
      if (!selectedAddress || !selectedVehicle) {
        Alert.alert('Error', 'Please select an address and vehicle');
        return;
      }

      const orderId = await createOrder(data);
      Alert.alert('Success', 'Order placed successfully!');
      onOrderComplete?.(orderId.orderId);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to place order');
    }
  };

  const calculateTotal = () => {
    if (!pricingData) return 0;
    
    const subtotal = pricingData.ourPrice * quantity;
    const tax = (subtotal + deliveryFee) * BUSINESS_RULES.TAX_RATE;
    return subtotal + deliveryFee + tax;
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((stepNumber) => (
        <View
          key={stepNumber}
          style={[
            styles.stepDot,
            step >= stepNumber && styles.stepDotActive,
          ]}>
          <Text style={[
            styles.stepText,
            step >= stepNumber && styles.stepTextActive,
          ]}>
            {stepNumber}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <Card style={styles.stepCard}>
      <Card.Title title="Select Delivery Address" />
      <Card.Content>
        {addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="location-off" size={48} color={COLORS.MEDIUM_GRAY} />
            <Text style={styles.emptyText}>No saved addresses</Text>
            <Button mode="outlined" onPress={() => {}}>
              Add Address
            </Button>
          </View>
        ) : (
          <View style={styles.addressList}>
            {addresses.map((address) => (
              <Card
                key={address.addressId}
                style={[
                  styles.selectionCard,
                  selectedAddress?.addressId === address.addressId && styles.selectedCard,
                ]}
                onPress={() => handleAddressSelect(address)}>
                <Card.Content>
                  <View style={styles.addressContent}>
                    <View style={styles.addressInfo}>
                      <Text style={styles.addressLabel}>{address.label}</Text>
                      <Text style={styles.addressText}>
                        {address.street}, {address.city}, {address.state} {address.zipCode}
                      </Text>
                    </View>
                    {selectedAddress?.addressId === address.addressId && (
                      <Icon name="check-circle" size={24} color={COLORS.SUCCESS_GREEN} />
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderStep2 = () => (
    <Card style={styles.stepCard}>
      <Card.Title title="Select Vehicle" />
      <Card.Content>
        {vehicles.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="directions-car-filled" size={48} color={COLORS.MEDIUM_GRAY} />
            <Text style={styles.emptyText}>No saved vehicles</Text>
            <Button mode="outlined" onPress={() => {}}>
              Add Vehicle
            </Button>
          </View>
        ) : (
          <View style={styles.vehicleList}>
            {vehicles.map((vehicle) => (
              <Card
                key={vehicle.vehicleId}
                style={[
                  styles.selectionCard,
                  selectedVehicle?.vehicleId === vehicle.vehicleId && styles.selectedCard,
                ]}
                onPress={() => handleVehicleSelect(vehicle)}>
                <Card.Content>
                  <View style={styles.vehicleContent}>
                    <View style={styles.vehicleInfo}>
                      <Text style={styles.vehicleTitle}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </Text>
                      <Text style={styles.vehicleDetails}>
                        {FUEL_TYPES.find(f => f.value === vehicle.fuelType)?.label} • {vehicle.tankCapacity} gal
                      </Text>
                    </View>
                    {selectedVehicle?.vehicleId === vehicle.vehicleId && (
                      <Icon name="check-circle" size={24} color={COLORS.SUCCESS_GREEN} />
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderStep3 = () => (
    <Card style={styles.stepCard}>
      <Card.Title title="Fuel Options" />
      <Card.Content>
        <View style={styles.fuelSection}>
          <Text style={styles.sectionLabel}>Fuel Type</Text>
          <Controller
            control={control}
            name="fuelType"
            render={({field: {onChange, value}}) => (
              <SegmentedButtons
                value={value}
                onValueChange={onChange}
                buttons={FUEL_TYPES.map(fuel => ({
                  value: fuel.value,
                  label: fuel.label,
                  icon: fuel.icon,
                }))}
                style={styles.segmentedButtons}
              />
            )}
          />
        </View>

        <View style={styles.quantitySection}>
          <Text style={styles.sectionLabel}>Quantity (gallons)</Text>
          <Controller
            control={control}
            name="quantity"
            rules={{
              required: 'Quantity is required',
              min: {value: BUSINESS_RULES.MIN_ORDER_QUANTITY, message: `Minimum ${BUSINESS_RULES.MIN_ORDER_QUANTITY} gallons`},
              max: {value: BUSINESS_RULES.MAX_ORDER_QUANTITY, message: `Maximum ${BUSINESS_RULES.MAX_ORDER_QUANTITY} gallons`},
            }}
            render={({field: {onChange, value}}) => (
              <View style={styles.quantityInput}>
                <Button
                  mode="outlined"
                  onPress={() => onChange(Math.max(BUSINESS_RULES.MIN_ORDER_QUANTITY, value - 1))}
                  disabled={value <= BUSINESS_RULES.MIN_ORDER_QUANTITY}>
                  -
                </Button>
                <TextInput
                  value={value.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 0;
                    onChange(Math.min(Math.max(num, BUSINESS_RULES.MIN_ORDER_QUANTITY), BUSINESS_RULES.MAX_ORDER_QUANTITY));
                  }}
                  keyboardType="numeric"
                  style={styles.quantityField}
                  textAlign="center"
                />
                <Button
                  mode="outlined"
                  onPress={() => onChange(Math.min(BUSINESS_RULES.MAX_ORDER_QUANTITY, value + 1))}
                  disabled={value >= BUSINESS_RULES.MAX_ORDER_QUANTITY}>
                  +
                </Button>
              </View>
            )}
          />
          {errors.quantity && (
            <Text style={styles.errorText}>{errors.quantity.message}</Text>
          )}
        </View>

        {pricingData && (
          <Card style={styles.pricingCard}>
            <Card.Content>
              <View style={styles.pricingHeader}>
                <Text style={styles.pricingTitle}>Pricing Information</Text>
                {pricingData.savings.perGallon > 0 && (
                  <Chip
                    mode="flat"
                    style={styles.savingsChip}
                    textStyle={styles.savingsText}>
                    Save ${pricingData.savings.perGallon.toFixed(2)}/gal
                  </Chip>
                )}
              </View>
              
              <View style={styles.pricingDetails}>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Our Price:</Text>
                  <Text style={styles.pricingValue}>${pricingData.ourPrice.toFixed(2)}/gal</Text>
                </View>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Market Average:</Text>
                  <Text style={styles.pricingValue}>${pricingData.marketAverage.toFixed(2)}/gal</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        <View style={styles.instructionsSection}>
          <Controller
            control={control}
            name="specialInstructions"
            render={({field: {onChange, value}}) => (
              <TextInput
                label="Special Instructions (Optional)"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                multiline
                numberOfLines={3}
                placeholder="Any special delivery instructions..."
                style={styles.instructionsInput}
              />
            )}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderStep4 = () => (
    <Card style={styles.stepCard}>
      <Card.Title title="Order Summary" />
      <Card.Content>
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Address:</Text>
            <Text style={styles.summaryValue}>
              {selectedAddress?.street}, {selectedAddress?.city}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Vehicle:</Text>
            <Text style={styles.summaryValue}>
              {selectedVehicle?.year} {selectedVehicle?.make} {selectedVehicle?.model}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fuel:</Text>
            <Text style={styles.summaryValue}>
              {FUEL_TYPES.find(f => f.value === fuelType)?.label} ({quantity} gallons)
            </Text>
          </View>
        </View>

        {pricingData && (
          <View style={styles.costBreakdown}>
            <Text style={styles.breakdownTitle}>Cost Breakdown</Text>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Fuel ({quantity} gal × ${pricingData.ourPrice.toFixed(2)}):</Text>
              <Text style={styles.breakdownValue}>
                ${(quantity * pricingData.ourPrice).toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Delivery Fee:</Text>
              <Text style={styles.breakdownValue}>${deliveryFee.toFixed(2)}</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Tax:</Text>
              <Text style={styles.breakdownValue}>
                ${((quantity * pricingData.ourPrice + deliveryFee) * BUSINESS_RULES.TAX_RATE).toFixed(2)}
              </Text>
            </View>
            
            <View style={[styles.breakdownRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${calculateTotal().toFixed(2)}</Text>
            </View>

            {pricingData.savings.totalSavings > 0 && (
              <View style={styles.savingsRow}>
                <Text style={styles.savingsLabel}>Your Savings:</Text>
                <Text style={styles.savingsAmount}>
                  ${pricingData.savings.totalSavings.toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderStepIndicator()}
      
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}

      <View style={styles.navigation}>
        {step > 1 && (
          <Button
            mode="outlined"
            onPress={() => setStep(step - 1)}
            style={styles.navButton}>
            Back
          </Button>
        )}
        
        {step < 4 ? (
          <Button
            mode="contained"
            onPress={() => setStep(step + 1)}
            style={styles.navButton}
            disabled={
              (step === 1 && !selectedAddress) ||
              (step === 2 && !selectedVehicle) ||
              (step === 3 && (!pricingData || loading))
            }>
            Next
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.navButton}
            loading={orderLoading}>
            Place Order
          </Button>
        )}
      </View>

      {onCancel && (
        <Button
          mode="text"
          onPress={onCancel}
          style={styles.cancelButton}>
          Cancel
        </Button>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    padding: SPACING.LG,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.XL,
    gap: SPACING.LG,
  },
  stepDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.LIGHT_GRAY,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.MEDIUM_GRAY,
  },
  stepDotActive: {
    backgroundColor: COLORS.PRIMARY_BLUE,
    borderColor: COLORS.PRIMARY_BLUE,
  },
  stepText: {
    ...TYPOGRAPHY.BUTTON,
    color: COLORS.MEDIUM_GRAY,
  },
  stepTextActive: {
    color: COLORS.PURE_WHITE,
  },
  stepCard: {
    backgroundColor: COLORS.PURE_WHITE,
    borderRadius: 12,
    marginBottom: SPACING.XL,
    elevation: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.XXXL,
  },
  emptyText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.MEDIUM_GRAY,
    marginVertical: SPACING.LG,
  },
  addressList: {
    gap: SPACING.MD,
  },
  vehicleList: {
    gap: SPACING.MD,
  },
  selectionCard: {
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
  },
  selectedCard: {
    borderColor: COLORS.PRIMARY_BLUE,
    borderWidth: 2,
  },
  addressContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    ...TYPOGRAPHY.HEADING_2,
    color: COLORS.DARK_SLATE,
  },
  addressText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.MEDIUM_GRAY,
    marginTop: SPACING.XS,
  },
  vehicleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleTitle: {
    ...TYPOGRAPHY.HEADING_2,
    color: COLORS.DARK_SLATE,
  },
  vehicleDetails: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.MEDIUM_GRAY,
    marginTop: SPACING.XS,
  },
  fuelSection: {
    marginBottom: SPACING.XL,
  },
  sectionLabel: {
    ...TYPOGRAPHY.HEADING_2,
    color: COLORS.DARK_SLATE,
    marginBottom: SPACING.MD,
  },
  segmentedButtons: {
    marginBottom: SPACING.MD,
  },
  quantitySection: {
    marginBottom: SPACING.XL,
  },
  quantityInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.MD,
  },
  quantityField: {
    flex: 1,
    backgroundColor: COLORS.PURE_WHITE,
  },
  errorText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.DANGER_RED,
    marginTop: SPACING.SM,
  },
  pricingCard: {
    backgroundColor: COLORS.LIGHT_GRAY,
    marginBottom: SPACING.XL,
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  pricingTitle: {
    ...TYPOGRAPHY.HEADING_2,
    color: COLORS.DARK_SLATE,
  },
  savingsChip: {
    backgroundColor: COLORS.SUCCESS_GREEN,
  },
  savingsText: {
    color: COLORS.PURE_WHITE,
  },
  pricingDetails: {
    gap: SPACING.SM,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pricingLabel: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.MEDIUM_GRAY,
  },
  pricingValue: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.DARK_SLATE,
    fontWeight: '600',
  },
  instructionsSection: {
    marginTop: SPACING.LG,
  },
  instructionsInput: {
    backgroundColor: COLORS.PURE_WHITE,
  },
  summarySection: {
    marginBottom: SPACING.XL,
    gap: SPACING.MD,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.MEDIUM_GRAY,
    flex: 1,
  },
  summaryValue: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.DARK_SLATE,
    flex: 2,
    textAlign: 'right',
  },
  costBreakdown: {
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
    paddingTop: SPACING.LG,
  },
  breakdownTitle: {
    ...TYPOGRAPHY.HEADING_2,
    color: COLORS.DARK_SLATE,
    marginBottom: SPACING.MD,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.SM,
  },
  breakdownLabel: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.MEDIUM_GRAY,
  },
  breakdownValue: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.DARK_SLATE,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
    paddingTop: SPACING.MD,
    marginTop: SPACING.MD,
  },
  totalLabel: {
    ...TYPOGRAPHY.HEADING_2,
    color: COLORS.DARK_SLATE,
  },
  totalValue: {
    ...TYPOGRAPHY.HEADING_2,
    color: COLORS.PRIMARY_BLUE,
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.SUCCESS_GREEN,
    padding: SPACING.MD,
    borderRadius: 8,
    marginTop: SPACING.MD,
  },
  savingsLabel: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.PURE_WHITE,
  },
  savingsAmount: {
    ...TYPOGRAPHY.HEADING_2,
    color: COLORS.PURE_WHITE,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.MD,
    marginBottom: SPACING.LG,
  },
  navButton: {
    flex: 1,
    borderRadius: 8,
  },
  cancelButton: {
    alignSelf: 'center',
    marginBottom: SPACING.XL,
  },
});

export default OrderForm;