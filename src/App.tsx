import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider as PaperProvider} from 'react-native-paper';
import {QueryClient, QueryClientProvider} from 'react-query';
import {StripeProvider} from '@stripe/stripe-react-native';

import RootNavigator from '@/navigation';
import {COLORS} from '@/constants';
import {theme} from '@/utils/theme';

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Stripe publishable key (replace with your actual key)
const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_stripe_publishable_key_here';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={theme}>
            <StatusBar
              barStyle="light-content"
              backgroundColor={COLORS.PRIMARY_BLUE}
              translucent={false}
            />
            <RootNavigator />
          </PaperProvider>
        </QueryClientProvider>
      </StripeProvider>
    </SafeAreaProvider>
  );
};

export default App;