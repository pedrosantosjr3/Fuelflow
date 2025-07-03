import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAuth } from '@/hooks/useAuth';
import { COLORS, SCREEN_NAMES } from '@/constants';
import { RootStackParamList, AuthStackParamList, MainTabParamList } from '@/types';

// Auth Screens
import WelcomeScreen from '@/screens/auth/WelcomeScreen';
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';

// Main Screens
import HomeScreen from '@/screens/home/HomeScreen';
import OrdersScreen from '@/screens/orders/OrdersScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import HistoryScreen from '@/screens/history/HistoryScreen';
import OrderTrackingScreen from '@/screens/tracking/OrderTrackingScreen';
import OrderDetailsScreen from '@/screens/orders/OrderDetailsScreen';
import PriceComparisonScreen from '@/screens/home/PriceComparisonScreen';

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// Auth Stack Navigator
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.PURE_WHITE },
      }}
    >
      <AuthStack.Screen name={SCREEN_NAMES.WELCOME} component={WelcomeScreen} />
      <AuthStack.Screen name={SCREEN_NAMES.LOGIN} component={LoginScreen} />
      <AuthStack.Screen name={SCREEN_NAMES.REGISTER} component={RegisterScreen} />
      <AuthStack.Screen name={SCREEN_NAMES.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
};

// Main Tab Navigator
const MainTabNavigator = () => {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case SCREEN_NAMES.HOME:
              iconName = focused ? 'home' : 'home';
              break;
            case SCREEN_NAMES.ORDERS:
              iconName = focused ? 'local-shipping' : 'local-shipping';
              break;
            case SCREEN_NAMES.HISTORY:
              iconName = focused ? 'history' : 'history';
              break;
            case SCREEN_NAMES.PROFILE:
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.PRIMARY_BLUE,
        tabBarInactiveTintColor: COLORS.MEDIUM_GRAY,
        tabBarStyle: {
          backgroundColor: COLORS.PURE_WHITE,
          borderTopWidth: 1,
          borderTopColor: COLORS.LIGHT_GRAY,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <MainTab.Screen 
        name={SCREEN_NAMES.HOME} 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <MainTab.Screen 
        name={SCREEN_NAMES.ORDERS} 
        component={OrdersScreen}
        options={{ tabBarLabel: 'Orders' }}
      />
      <MainTab.Screen 
        name={SCREEN_NAMES.HISTORY} 
        component={HistoryScreen}
        options={{ tabBarLabel: 'History' }}
      />
      <MainTab.Screen 
        name={SCREEN_NAMES.PROFILE} 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </MainTab.Navigator>
  );
};

// Main Stack Navigator
const MainNavigator = () => {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.PRIMARY_BLUE,
        },
        headerTintColor: COLORS.PURE_WHITE,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <RootStack.Screen 
        name="MainTabs" 
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <RootStack.Screen 
        name={SCREEN_NAMES.ORDER_TRACKING} 
        component={OrderTrackingScreen}
        options={{ 
          title: 'Track Order',
          headerBackTitleVisible: false,
        }}
      />
      <RootStack.Screen 
        name={SCREEN_NAMES.ORDER_DETAILS} 
        component={OrderDetailsScreen}
        options={{ 
          title: 'Order Details',
          headerBackTitleVisible: false,
        }}
      />
      <RootStack.Screen 
        name={SCREEN_NAMES.PRICE_COMPARISON} 
        component={PriceComparisonScreen}
        options={{ 
          title: 'Price Comparison',
          headerBackTitleVisible: false,
        }}
      />
    </RootStack.Navigator>
  );
};

// Root Navigator
const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // TODO: Add loading screen component
    return null;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <RootStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;