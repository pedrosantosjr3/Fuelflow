# FuelFlow - On-Demand Fuel Delivery App

![FuelFlow Logo](assets/images/logo.png)

FuelFlow is a comprehensive React Native mobile application that provides on-demand fuel delivery services. The app connects customers with fuel delivery providers, offering competitive pricing, convenient scheduling, and real-time order tracking.

## 🚀 Features

### Customer Features
- **User Authentication**: Secure registration and login with email/password and social media
- **Fuel Ordering**: Order fuel delivery to any location with flexible scheduling
- **Real-time Tracking**: Track your delivery driver in real-time with live updates
- **Price Comparison**: Compare fuel prices with local gas stations and see your savings
- **Multiple Vehicles**: Manage multiple vehicles and equipment requiring fuel
- **Payment Integration**: Secure payment processing with Stripe
- **Order History**: View past orders and track spending/savings
- **Push Notifications**: Real-time updates on order status and promotions

### Admin Features
- **Order Management**: View, manage, and dispatch orders
- **Customer Management**: Handle customer accounts and support requests
- **Analytics Dashboard**: Real-time business metrics and reporting
- **Pricing Management**: Set and adjust fuel prices and delivery fees
- **Driver Management**: Assign and track delivery drivers
- **Inventory Management**: Monitor fuel supply and distribution

## 🛠 Technology Stack

- **Frontend**: React Native with TypeScript
- **Backend**: Firebase (Firestore, Auth, Functions, Storage, Cloud Messaging)
- **Navigation**: React Navigation v6
- **UI Framework**: React Native Paper
- **State Management**: React Query for server state management
- **Payment Processing**: Stripe React Native SDK
- **Maps & Location**: React Native Maps with Google Maps
- **Testing**: Jest with React Native Testing Library
- **Code Quality**: ESLint, Prettier, TypeScript

## 📱 Screenshots

| Welcome Screen | Login Screen | Home Dashboard | Order Tracking |
|:---:|:---:|:---:|:---:|
| ![Welcome](assets/screenshots/welcome.png) | ![Login](assets/screenshots/login.png) | ![Home](assets/screenshots/home.png) | ![Tracking](assets/screenshots/tracking.png) |

## 🔧 Installation & Setup

### Prerequisites
- Node.js >= 16.0.0
- React Native development environment
- iOS Simulator / Android Emulator
- Firebase project
- Stripe account

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/fuelflow.git
   cd fuelflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication, Firestore, Storage, and Cloud Messaging
   - Download configuration files and place them in the appropriate directories

4. **Configure Stripe**
   - Create a Stripe account and get your API keys
   - Update the Stripe configuration in `src/App.tsx`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Run on your preferred platform**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

## 📋 Available Scripts

```bash
npm run dev              # Start Metro bundler
npm run ios              # Run on iOS simulator
npm run android          # Run on Android emulator
npm test                 # Run unit tests
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler
npm run build:android    # Build Android APK
npm run build:ios        # Build iOS app
npm run clean            # Clean project cache
```

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Input, etc.)
│   ├── auth/           # Authentication components
│   ├── orders/         # Order-related components
│   └── tracking/       # Tracking components
├── screens/            # Screen components
│   ├── auth/           # Authentication screens
│   ├── home/           # Home and dashboard screens
│   ├── orders/         # Order management screens
│   └── profile/        # Profile screens
├── navigation/         # Navigation configuration
├── services/           # API services and Firebase integration
├── hooks/              # Custom React hooks
├── utils/              # Utility functions and helpers
├── types/              # TypeScript type definitions
├── constants/          # App constants and configuration
└── App.tsx            # Root application component
```

## 🔥 Firebase Configuration

### Required Firebase Services
- **Authentication**: User management and security
- **Firestore**: Real-time database for app data
- **Cloud Functions**: Server-side logic and integrations
- **Storage**: File uploads and media storage
- **Cloud Messaging**: Push notifications

### Database Schema
The app uses the following Firestore collections:
- `users`: User profiles, addresses, vehicles, payment methods
- `orders`: Order details, status, and tracking information
- `gasStations`: Gas station data and current pricing
- `priceComparisons`: Price comparison data by location

## 💳 Payment Integration

FuelFlow uses Stripe for secure payment processing:
- Credit/debit card payments
- Digital wallet support (Apple Pay, Google Pay)
- Subscription management for recurring deliveries
- Secure tokenization and PCI compliance

## 🗺 Maps & Location Services

- Google Maps integration for address selection and tracking
- Real-time driver location updates
- Route optimization for efficient deliveries
- Geofencing for delivery confirmations

## 🧪 Testing

Run the test suite:
```bash
npm test                 # Run all tests
npm test -- --watch     # Run tests in watch mode
npm test -- --coverage  # Run tests with coverage report
```

## 🚀 Deployment

### Mobile App Stores
- **iOS**: Deploy to App Store via Xcode and App Store Connect
- **Android**: Deploy to Google Play Store via Android Studio

### Demo Deployment
- **Expo Go**: Quick demos and testing
- **TestFlight/Play Console**: Beta testing with stakeholders
- **Vercel**: Web demo version for presentations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write unit tests for new features
- Update documentation for significant changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@fuelflow.com
- 📚 Documentation: [docs.fuelflow.com](https://docs.fuelflow.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/fuelflow/issues)

## 🎯 Roadmap

- [ ] **v1.1**: Recurring delivery subscriptions
- [ ] **v1.2**: Fleet management for businesses
- [ ] **v1.3**: Electric vehicle charging integration
- [ ] **v1.4**: Multi-language support
- [ ] **v1.5**: Advanced analytics and reporting

## 📈 Business Model

FuelFlow operates on a marketplace model:
- **Delivery Fees**: Per-delivery charges for convenience
- **Price Margins**: Competitive fuel pricing with transparent margins
- **Subscription Plans**: Premium features for frequent users
- **Enterprise Solutions**: Bulk fuel delivery for businesses

---

Built with ❤️ by the FuelFlow Team