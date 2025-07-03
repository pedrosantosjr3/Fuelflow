import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {COLORS, TYPOGRAPHY, SPACING} from '@/constants';

const OrderTrackingScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Order Tracking</Text>
        <Text style={styles.subtitle}>Track your delivery in real-time</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PURE_WHITE,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.XL,
  },
  title: {
    ...TYPOGRAPHY.DISPLAY,
    color: COLORS.DARK_SLATE,
    marginBottom: SPACING.SM,
  },
  subtitle: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.MEDIUM_GRAY,
    textAlign: 'center',
  },
});

export default OrderTrackingScreen;