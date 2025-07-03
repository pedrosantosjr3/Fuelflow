import React from 'react';
import {View, Text, StyleSheet, Image, Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';

import {AuthStackParamList} from '@/types';
import {COLORS, TYPOGRAPHY, SPACING, SCREEN_NAMES} from '@/constants';

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

const {width, height} = Dimensions.get('window');

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  const handleSignIn = () => {
    navigation.navigate(SCREEN_NAMES.LOGIN);
  };

  const handleGetStarted = () => {
    navigation.navigate(SCREEN_NAMES.REGISTER);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.PRIMARY_BLUE, COLORS.FUEL_ORANGE]}
        style={styles.gradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <View style={styles.content}>
          {/* Logo and App Name */}
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>⛽</Text>
            </View>
            <Text style={styles.appName}>FuelFlow</Text>
          </View>

          {/* Hero Content */}
          <View style={styles.heroContent}>
            <Text style={styles.tagline}>Fuel delivered to your door</Text>
            <Text style={styles.description}>
              Get premium fuel delivered anywhere, anytime. Save time and money with competitive
              pricing and convenient scheduling.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <Button
              mode="contained"
              onPress={handleGetStarted}
              style={styles.primaryButton}
              labelStyle={styles.primaryButtonText}
              contentStyle={styles.buttonContent}>
              Get Started
            </Button>
            
            <Button
              mode="outlined"
              onPress={handleSignIn}
              style={styles.secondaryButton}
              labelStyle={styles.secondaryButtonText}
              contentStyle={styles.buttonContent}>
              Sign In
            </Button>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>💰</Text>
              <Text style={styles.featureText}>Save Money</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>⏰</Text>
              <Text style={styles.featureText}>Save Time</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>📱</Text>
              <Text style={styles.featureText}>Easy Ordering</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.XL,
    paddingVertical: SPACING.XXXL,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: SPACING.XXXL,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.PURE_WHITE,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.LG,
  },
  logoText: {
    fontSize: 40,
  },
  appName: {
    ...TYPOGRAPHY.DISPLAY,
    color: COLORS.PURE_WHITE,
    fontWeight: 'bold',
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
  },
  tagline: {
    ...TYPOGRAPHY.HEADING_1,
    color: COLORS.PURE_WHITE,
    textAlign: 'center',
    marginBottom: SPACING.LG,
  },
  description: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.PURE_WHITE,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  actionContainer: {
    width: '100%',
    gap: SPACING.MD,
  },
  primaryButton: {
    backgroundColor: COLORS.PURE_WHITE,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: COLORS.PRIMARY_BLUE,
    ...TYPOGRAPHY.BUTTON,
  },
  secondaryButton: {
    borderColor: COLORS.PURE_WHITE,
    borderWidth: 2,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: COLORS.PURE_WHITE,
    ...TYPOGRAPHY.BUTTON,
  },
  buttonContent: {
    paddingVertical: SPACING.MD,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING.XL,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: SPACING.SM,
  },
  featureText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.PURE_WHITE,
    textAlign: 'center',
    opacity: 0.9,
  },
});

export default WelcomeScreen;