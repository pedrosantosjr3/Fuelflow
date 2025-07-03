import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, Button, Chip} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {useAuth} from '@/hooks/useAuth';
import {COLORS, TYPOGRAPHY, SPACING} from '@/constants';

const HomeScreen: React.FC = () => {
  const {user} = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning, {user?.firstName}! 👋</Text>
          <Text style={styles.subtitle}>Your fuel is cheaper today</Text>
        </View>

        {/* Quick Order Card */}
        <Card style={styles.quickOrderCard}>
          <Card.Content>
            <View style={styles.quickOrderHeader}>
              <Text style={styles.cardTitle}>Quick Order</Text>
              <Icon name="local-gas-station" size={24} color={COLORS.FUEL_ORANGE} />
            </View>
            
            <View style={styles.quickOrderDetails}>
              <View style={styles.detailRow}>
                <Icon name="location-on" size={16} color={COLORS.MEDIUM_GRAY} />
                <Text style={styles.detailText}>Home - 123 Main St</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="directions-car" size={16} color={COLORS.MEDIUM_GRAY} />
                <Text style={styles.detailText}>Honda Civic 2020</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="local-gas-station" size={16} color={COLORS.MEDIUM_GRAY} />
                <Text style={styles.detailText}>Premium Gas - $3.89/gal</Text>
              </View>
            </View>

            <Button
              mode="contained"
              onPress={() => {}}
              style={styles.orderButton}
              labelStyle={styles.orderButtonText}>
              Order Now
            </Button>
          </Card.Content>
        </Card>

        {/* Current Deliveries */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Deliveries</Text>
          
          <Card style={styles.deliveryCard}>
            <Card.Content>
              <View style={styles.deliveryHeader}>
                <Text style={styles.orderNumber}>Order #1234</Text>
                <Chip
                  mode="flat"
                  style={styles.statusChip}
                  textStyle={styles.statusText}>
                  En Route
                </Chip>
              </View>
              
              <View style={styles.deliveryDetails}>
                <View style={styles.detailRow}>
                  <Icon name="person" size={16} color={COLORS.MEDIUM_GRAY} />
                  <Text style={styles.detailText}>Driver: Mike</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="schedule" size={16} color={COLORS.MEDIUM_GRAY} />
                  <Text style={styles.detailText}>5 mins away</Text>
                </View>
              </View>

              <Button
                mode="outlined"
                onPress={() => {}}
                style={styles.trackButton}
                labelStyle={styles.trackButtonText}>
                Track Order
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* Savings Summary */}
        <Card style={styles.savingsCard}>
          <Card.Content>
            <View style={styles.savingsHeader}>
              <Text style={styles.cardTitle}>Savings This Month</Text>
              <Text style={styles.savingsAmount}>$127.50 💰</Text>
            </View>
            
            <View style={styles.savingsDetails}>
              <View style={styles.savingsRow}>
                <Text style={styles.savingsLabel}>Total Orders:</Text>
                <Text style={styles.savingsValue}>8</Text>
              </View>
              <View style={styles.savingsRow}>
                <Text style={styles.savingsLabel}>Average Savings:</Text>
                <Text style={styles.savingsValue}>$15.94</Text>
              </View>
              <View style={styles.savingsRow}>
                <Text style={styles.savingsLabel}>Compared to stations:</Text>
                <Text style={styles.savingsValue}>Shell, Exxon</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActions}>
            <Button
              mode="outlined"
              onPress={() => {}}
              style={styles.quickActionButton}
              labelStyle={styles.quickActionText}
              icon="compare-arrows">
              Compare Prices
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => {}}
              style={styles.quickActionButton}
              labelStyle={styles.quickActionText}
              icon="schedule">
              Schedule Delivery
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => {}}
              style={styles.quickActionButton}
              labelStyle={styles.quickActionText}
              icon="directions-car">
              Add Vehicle
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  scrollContent: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.LG,
  },
  header: {
    marginBottom: SPACING.XL,
  },
  greeting: {
    ...TYPOGRAPHY.HEADING_1,
    color: COLORS.DARK_SLATE,
    marginBottom: SPACING.XS,
  },
  subtitle: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.MEDIUM_GRAY,
  },
  quickOrderCard: {
    backgroundColor: COLORS.PURE_WHITE,
    borderRadius: 12,
    marginBottom: SPACING.XL,
    elevation: 2,
  },
  quickOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.LG,
  },
  cardTitle: {
    ...TYPOGRAPHY.HEADING_2,
    color: COLORS.DARK_SLATE,
  },
  quickOrderDetails: {
    marginBottom: SPACING.LG,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  detailText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.DARK_SLATE,
    marginLeft: SPACING.SM,
  },
  orderButton: {
    backgroundColor: COLORS.PRIMARY_BLUE,
    borderRadius: 8,
  },
  orderButtonText: {
    ...TYPOGRAPHY.BUTTON,
    color: COLORS.PURE_WHITE,
  },
  section: {
    marginBottom: SPACING.XL,
  },
  sectionTitle: {
    ...TYPOGRAPHY.HEADING_2,
    color: COLORS.DARK_SLATE,
    marginBottom: SPACING.LG,
  },
  deliveryCard: {
    backgroundColor: COLORS.PURE_WHITE,
    borderRadius: 12,
    elevation: 2,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.LG,
  },
  orderNumber: {
    ...TYPOGRAPHY.HEADING_2,
    color: COLORS.DARK_SLATE,
  },
  statusChip: {
    backgroundColor: COLORS.FUEL_ORANGE,
  },
  statusText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.PURE_WHITE,
  },
  deliveryDetails: {
    marginBottom: SPACING.LG,
  },
  trackButton: {
    borderColor: COLORS.PRIMARY_BLUE,
    borderRadius: 8,
  },
  trackButtonText: {
    ...TYPOGRAPHY.BUTTON,
    color: COLORS.PRIMARY_BLUE,
  },
  savingsCard: {
    backgroundColor: COLORS.SUCCESS_GREEN,
    borderRadius: 12,
    marginBottom: SPACING.XL,
    elevation: 2,
  },
  savingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.LG,
  },
  savingsAmount: {
    ...TYPOGRAPHY.HEADING_1,
    color: COLORS.PURE_WHITE,
  },
  savingsDetails: {
    gap: SPACING.SM,
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savingsLabel: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.PURE_WHITE,
    opacity: 0.9,
  },
  savingsValue: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.PURE_WHITE,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.MD,
  },
  quickActionButton: {
    flex: 1,
    minWidth: 100,
    borderColor: COLORS.PRIMARY_BLUE,
    borderRadius: 8,
  },
  quickActionText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.PRIMARY_BLUE,
  },
});

export default HomeScreen;