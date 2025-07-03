# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FuelFlow is a React Native mobile application for on-demand fuel delivery services. The app connects customers with fuel delivery services, offering competitive pricing and convenient scheduling.

## Technology Stack

- **Frontend**: React Native with TypeScript
- **Backend**: Firebase (Firestore, Auth, Functions, Storage)
- **Navigation**: React Navigation v6
- **UI Library**: React Native Paper
- **State Management**: React Query for server state
- **Payment Processing**: Stripe
- **Maps**: React Native Maps (Google Maps)
- **Testing**: Jest with React Native Testing Library
- **Code Quality**: ESLint, Prettier, TypeScript

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run tests
npm test

# Lint code
npm run lint

# Type checking
npm run type-check

# Build for production
npm run build:android  # Android
npm run build:ios      # iOS

# Clean project
npm run clean
```

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── common/       # Generic components (Button, Input, etc.)
│   ├── auth/         # Authentication components
│   ├── orders/       # Order-related components
│   ├── profile/      # Profile components
│   └── tracking/     # Tracking components
├── screens/          # Screen components
│   ├── auth/         # Authentication screens
│   ├── home/         # Home and dashboard screens
│   ├── orders/       # Order management screens
│   ├── profile/      # Profile screens
│   ├── tracking/     # Order tracking screens
│   └── admin/        # Admin dashboard screens
├── navigation/       # Navigation configuration
├── services/         # API services and integrations
│   └── firebase.ts   # Firebase service layer
├── hooks/            # Custom React hooks
│   └── useAuth.ts    # Authentication hook
├── utils/            # Utility functions and helpers
│   └── theme.ts      # UI theme configuration
├── types/            # TypeScript type definitions
├── constants/        # App constants and configuration
└── App.tsx          # Root app component
```

## Key Architecture Patterns

### Authentication Flow
- Firebase Auth for user authentication
- Custom `useAuth` hook for auth state management
- Protected routes with automatic navigation
- Support for email/password and social login

### Data Management
- Firebase Firestore for real-time database
- React Query for caching and synchronization
- Service layer pattern for API interactions
- TypeScript interfaces for type safety

### Navigation Structure
- Stack navigation for auth flow
- Tab navigation for main app
- Nested navigators for complex flows
- Type-safe navigation with TypeScript

### UI Design System
- Consistent color palette and typography
- Reusable component library
- Theme support (light/dark mode)
- Responsive design for different screen sizes

## Firebase Configuration

The app uses Firebase for backend services:

- **Authentication**: User registration, login, password reset
- **Firestore**: Real-time database for users, orders, gas stations
- **Cloud Functions**: Server-side logic and integrations
- **Storage**: File uploads (profile pictures, documents)
- **Cloud Messaging**: Push notifications

### Database Collections

- `users`: User profiles, addresses, vehicles, payment methods
- `orders`: Order details, status, tracking information
- `gasStations`: Gas station data and pricing information
- `priceComparisons`: Price comparison data by location

## Key Features Implementation

### User Management
- Registration with email verification
- Profile management with multiple addresses and vehicles
- Payment method management with Stripe integration

### Order System
- Fuel type selection (regular, premium, diesel)
- Address and vehicle selection
- Real-time pricing and savings calculation
- Order tracking with live updates

### Price Comparison
- Real-time gas station price fetching
- Savings calculation vs. local stations
- Historical price trends
- Market analysis and alerts

### Admin Dashboard
- Order management and dispatch
- Customer service tools
- Analytics and reporting
- Pricing and inventory management

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use absolute imports with @ alias
- Implement proper error handling

### Component Guidelines
- Create reusable components in `components/common/`
- Use React Native Paper for UI consistency
- Implement proper loading and error states
- Follow the established design system

### State Management
- Use React Query for server state
- Use React hooks for local component state
- Implement proper loading and error states
- Cache data appropriately

### Testing Strategy
- Write unit tests for utilities and hooks
- Test components with React Native Testing Library
- Mock Firebase services in tests
- Aim for good test coverage

## Environment Setup

### Prerequisites
- Node.js >= 16
- React Native development environment
- Firebase project with appropriate configuration
- Stripe account for payment processing

### Required Configuration
1. Firebase configuration in Firebase console
2. Stripe API keys for payment processing
3. Google Maps API key for location services
4. Push notification certificates

## Deployment

### Mobile App Deployment
- iOS: App Store via Xcode and App Store Connect
- Android: Google Play Store via Android Studio

### Demo Deployment Options
- **Expo Go**: For quick demos and testing
- **TestFlight/Play Console**: For beta testing
- **Vercel**: For web demo version

### CI/CD Pipeline
- Automated testing on pull requests
- Build verification for both platforms
- Automated deployment to staging environments

## Common Development Tasks

### Adding New Screens
1. Create screen component in appropriate `screens/` subdirectory
2. Add to navigation configuration
3. Update type definitions for navigation
4. Implement proper error boundaries

### Integrating APIs
1. Add service functions to `services/` directory
2. Create React Query hooks for data fetching
3. Implement proper error handling
4. Add TypeScript types for API responses

### Firebase Operations
1. Use the service layer in `services/firebase.ts`
2. Implement proper error handling
3. Use real-time listeners for live updates
4. Follow Firebase security rules

## Troubleshooting

### Common Issues
- **Metro bundler issues**: Run `npm run clean` and restart
- **iOS build issues**: Clean Xcode build folder and rebuild
- **Android build issues**: Clean gradle cache and rebuild
- **Firebase connection**: Check configuration and network

### Debug Commands
```bash
# Reset Metro cache
npx react-native start --reset-cache

# Clean and rebuild
npm run clean && npm install

# Debug Android
npx react-native run-android --verbose

# Debug iOS
npx react-native run-ios --verbose
```

## Resources

- [React Native Documentation](https://reactnative.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Navigation](https://reactnavigation.org/)
- [React Native Paper](https://reactnativepaper.com/)
- [Stripe React Native](https://stripe.dev/stripe-react-native)