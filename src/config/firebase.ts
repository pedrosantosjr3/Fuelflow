import {FirebaseOptions} from '@react-native-firebase/app';

// Firebase configuration - replace with your actual config
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.FIREBASE_API_KEY || 'your-api-key',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'fuelflow-app.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'fuelflow-app',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'fuelflow-app.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.FIREBASE_APP_ID || '1:123456789:android:abcdef',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-XXXXXXXXXX',
};

// Environment-specific configuration
export const getFirebaseConfig = (): FirebaseOptions => {
  if (__DEV__) {
    // Development configuration
    return {
      ...firebaseConfig,
      // Use emulator in development if needed
      // host: 'localhost',
      // port: 8080,
    };
  }
  
  // Production configuration
  return firebaseConfig;
};

export default firebaseConfig;