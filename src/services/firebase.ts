import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import messaging from '@react-native-firebase/messaging';
import storage from '@react-native-firebase/storage';
import { FIREBASE_CONFIG } from '@/constants';
import { User, Order, GasStation, PriceComparison } from '@/types';

// Firebase Collections
const collections = {
  users: () => firestore().collection(FIREBASE_CONFIG.COLLECTIONS.USERS),
  orders: () => firestore().collection(FIREBASE_CONFIG.COLLECTIONS.ORDERS),
  gasStations: () => firestore().collection(FIREBASE_CONFIG.COLLECTIONS.GAS_STATIONS),
  priceComparisons: () => firestore().collection(FIREBASE_CONFIG.COLLECTIONS.PRICE_COMPARISONS),
};

// Authentication Services
export const authService = {
  // Sign up with email and password
  signUp: async (email: string, password: string) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await auth().signOut();
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (email: string) => {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error) {
      throw error;
    }
  },

  // Get current user
  getCurrentUser: () => auth().currentUser,

  // Listen to auth state changes
  onAuthStateChanged: (callback: (user: any) => void) => {
    return auth().onAuthStateChanged(callback);
  },
};

// User Services
export const userService = {
  // Create user document
  createUser: async (userId: string, userData: Partial<User>) => {
    try {
      await collections.users().doc(userId).set({
        ...userData,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      throw error;
    }
  },

  // Get user document
  getUser: async (userId: string): Promise<User | null> => {
    try {
      const doc = await collections.users().doc(userId).get();
      if (doc.exists) {
        return { userId, ...doc.data() } as User;
      }
      return null;
    } catch (error) {
      throw error;
    }
  },

  // Update user document
  updateUser: async (userId: string, userData: Partial<User>) => {
    try {
      await collections.users().doc(userId).update({
        ...userData,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      throw error;
    }
  },

  // Delete user document
  deleteUser: async (userId: string) => {
    try {
      await collections.users().doc(userId).delete();
    } catch (error) {
      throw error;
    }
  },

  // Listen to user document changes
  onUserChanged: (userId: string, callback: (user: User | null) => void) => {
    return collections.users().doc(userId).onSnapshot((doc) => {
      if (doc.exists) {
        callback({ userId, ...doc.data() } as User);
      } else {
        callback(null);
      }
    });
  },
};

// Order Services
export const orderService = {
  // Create order
  createOrder: async (orderData: Omit<Order, 'orderId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await collections.orders().add({
        ...orderData,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      throw error;
    }
  },

  // Get order
  getOrder: async (orderId: string): Promise<Order | null> => {
    try {
      const doc = await collections.orders().doc(orderId).get();
      if (doc.exists) {
        return { orderId, ...doc.data() } as Order;
      }
      return null;
    } catch (error) {
      throw error;
    }
  },

  // Update order
  updateOrder: async (orderId: string, orderData: Partial<Order>) => {
    try {
      await collections.orders().doc(orderId).update({
        ...orderData,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      throw error;
    }
  },

  // Get user orders
  getUserOrders: async (userId: string): Promise<Order[]> => {
    try {
      const snapshot = await collections.orders()
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        orderId: doc.id,
        ...doc.data(),
      })) as Order[];
    } catch (error) {
      throw error;
    }
  },

  // Listen to order changes
  onOrderChanged: (orderId: string, callback: (order: Order | null) => void) => {
    return collections.orders().doc(orderId).onSnapshot((doc) => {
      if (doc.exists) {
        callback({ orderId, ...doc.data() } as Order);
      } else {
        callback(null);
      }
    });
  },

  // Cancel order
  cancelOrder: async (orderId: string) => {
    try {
      await collections.orders().doc(orderId).update({
        status: 'cancelled',
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      throw error;
    }
  },
};

// Gas Station Services
export const gasStationService = {
  // Get nearby gas stations
  getNearbyStations: async (latitude: number, longitude: number, radius: number = 10): Promise<GasStation[]> => {
    try {
      // Note: This is a simplified version. In production, you'd use geohash queries
      const snapshot = await collections.gasStations()
        .where('isActive', '==', true)
        .get();
      
      return snapshot.docs.map(doc => ({
        stationId: doc.id,
        ...doc.data(),
      })) as GasStation[];
    } catch (error) {
      throw error;
    }
  },

  // Get station by ID
  getStation: async (stationId: string): Promise<GasStation | null> => {
    try {
      const doc = await collections.gasStations().doc(stationId).get();
      if (doc.exists) {
        return { stationId, ...doc.data() } as GasStation;
      }
      return null;
    } catch (error) {
      throw error;
    }
  },

  // Update station prices
  updateStationPrices: async (stationId: string, prices: any) => {
    try {
      await collections.gasStations().doc(stationId).update({
        currentPrices: {
          ...prices,
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        },
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      throw error;
    }
  },
};

// Price Comparison Services
export const priceComparisonService = {
  // Get price comparison for area
  getPriceComparison: async (zipCode: string, fuelType: string): Promise<PriceComparison | null> => {
    try {
      const snapshot = await collections.priceComparisons()
        .where('zipCode', '==', zipCode)
        .where('fuelType', '==', fuelType)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { comparisonId: doc.id, ...doc.data() } as PriceComparison;
      }
      return null;
    } catch (error) {
      throw error;
    }
  },

  // Create price comparison
  createPriceComparison: async (comparisonData: Omit<PriceComparison, 'comparisonId' | 'createdAt'>) => {
    try {
      const docRef = await collections.priceComparisons().add({
        ...comparisonData,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      throw error;
    }
  },
};

// Cloud Functions
export const functionsService = {
  // Call cloud function
  callFunction: async (functionName: string, data?: any) => {
    try {
      const cloudFunction = functions().httpsCallable(functionName);
      const result = await cloudFunction(data);
      return result.data;
    } catch (error) {
      throw error;
    }
  },

  // Process payment
  processPayment: async (paymentData: any) => {
    return functionsService.callFunction('processPayment', paymentData);
  },

  // Calculate delivery fee
  calculateDeliveryFee: async (address: any) => {
    return functionsService.callFunction('calculateDeliveryFee', address);
  },

  // Get fuel prices
  getFuelPrices: async (zipCode: string) => {
    return functionsService.callFunction('getFuelPrices', { zipCode });
  },
};

// Push Notifications
export const notificationService = {
  // Request permission
  requestPermission: async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      return enabled;
    } catch (error) {
      throw error;
    }
  },

  // Get FCM token
  getToken: async () => {
    try {
      const token = await messaging().getToken();
      return token;
    } catch (error) {
      throw error;
    }
  },

  // Listen to messages
  onMessage: (callback: (message: any) => void) => {
    return messaging().onMessage(callback);
  },

  // Background message handler
  setBackgroundMessageHandler: (handler: (message: any) => Promise<void>) => {
    messaging().setBackgroundMessageHandler(handler);
  },
};

// Storage Services
export const storageService = {
  // Upload file
  uploadFile: async (filePath: string, fileName: string) => {
    try {
      const reference = storage().ref(fileName);
      await reference.putFile(filePath);
      const downloadURL = await reference.getDownloadURL();
      return downloadURL;
    } catch (error) {
      throw error;
    }
  },

  // Delete file
  deleteFile: async (fileName: string) => {
    try {
      const reference = storage().ref(fileName);
      await reference.delete();
    } catch (error) {
      throw error;
    }
  },

  // Get download URL
  getDownloadURL: async (fileName: string) => {
    try {
      const reference = storage().ref(fileName);
      const downloadURL = await reference.getDownloadURL();
      return downloadURL;
    } catch (error) {
      throw error;
    }
  },
};

export default {
  auth: authService,
  user: userService,
  order: orderService,
  gasStation: gasStationService,
  priceComparison: priceComparisonService,
  functions: functionsService,
  notification: notificationService,
  storage: storageService,
};