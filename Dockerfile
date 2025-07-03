# Dockerfile for development environment and demo deployment

# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    git \
    openssh \
    bash \
    curl \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create environment file
RUN echo "NODE_ENV=development" > .env

# Expose ports
EXPOSE 3000 8081 19000 19001 19002

# Install global tools
RUN npm install -g @expo/cli @react-native-community/cli firebase-tools

# Create startup script
RUN cat > start.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting FuelFlow Development Environment..."

# Start Metro bundler in background
echo "📱 Starting Metro bundler..."
npx react-native start --reset-cache &

# Start Firebase emulators if firebase.json exists
if [ -f "firebase.json" ]; then
    echo "🔥 Starting Firebase emulators..."
    firebase emulators:start &
fi

# Start web demo if available
if [ -f "web/package.json" ]; then
    echo "🌐 Starting web demo..."
    cd web && npm start &
    cd ..
fi

echo "✅ FuelFlow development environment is ready!"
echo ""
echo "📱 Metro bundler: http://localhost:8081"
echo "🔥 Firebase UI: http://localhost:4000"
echo "🌐 Web demo: http://localhost:3000"
echo ""
echo "To run on device:"
echo "  Android: npx react-native run-android"
echo "  iOS: npx react-native run-ios"
echo ""

# Keep container running
wait
EOF

RUN chmod +x start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8081/status || exit 1

# Default command
CMD ["./start.sh"]