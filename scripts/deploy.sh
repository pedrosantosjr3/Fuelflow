#!/bin/bash

# FuelFlow Deployment Script
# This script handles deployment to various environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Install project dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    npm ci
    print_success "Dependencies installed"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    npm test -- --watchAll=false --coverage
    print_success "All tests passed"
}

# Run linting
run_linting() {
    print_status "Running linter..."
    npm run lint
    print_success "Linting passed"
}

# Run type checking
run_type_check() {
    print_status "Running type check..."
    npm run type-check
    print_success "Type check passed"
}

# Deploy to Expo for demo
deploy_expo_demo() {
    print_status "Deploying to Expo for demo..."
    
    if ! command -v expo &> /dev/null; then
        print_status "Installing Expo CLI..."
        npm install -g @expo/cli
    fi
    
    local channel=${1:-"demo"}
    
    print_status "Publishing to Expo channel: $channel"
    expo publish --channel=$channel
    
    print_success "Demo deployed to Expo"
    print_status "Share this QR code with stakeholders:"
    expo url --type=exp --channel=$channel
}

# Deploy to Vercel for web demo
deploy_vercel_demo() {
    print_status "Deploying web demo to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Build web version
    if [ -f "web/package.json" ]; then
        print_status "Building web version..."
        cd web
        npm install
        npm run build
        cd ..
    fi
    
    # Deploy to Vercel
    vercel --prod
    
    print_success "Web demo deployed to Vercel"
}

# Deploy Firebase functions and rules
deploy_firebase() {
    print_status "Deploying to Firebase..."
    
    if ! command -v firebase &> /dev/null; then
        print_status "Installing Firebase CLI..."
        npm install -g firebase-tools
    fi
    
    # Deploy everything
    firebase deploy
    
    print_success "Firebase deployment completed"
}

# Build Android APK
build_android() {
    print_status "Building Android APK..."
    
    if [ ! -d "android" ]; then
        print_error "Android directory not found"
        exit 1
    fi
    
    cd android
    ./gradlew assembleRelease
    cd ..
    
    print_success "Android APK built successfully"
    print_status "APK location: android/app/build/outputs/apk/release/app-release.apk"
}

# Build iOS archive
build_ios() {
    print_status "Building iOS archive..."
    
    if [ ! -d "ios" ]; then
        print_error "iOS directory not found"
        exit 1
    fi
    
    if [[ "$OSTYPE" != "darwin"* ]]; then
        print_error "iOS builds can only be created on macOS"
        exit 1
    fi
    
    cd ios
    xcodebuild -workspace FuelFlow.xcworkspace \
        -scheme FuelFlow \
        -configuration Release \
        -destination 'generic/platform=iOS' \
        -archivePath FuelFlow.xcarchive \
        archive
    cd ..
    
    print_success "iOS archive built successfully"
}

# Deploy to EAS (Expo Application Services)
deploy_eas() {
    print_status "Deploying with EAS..."
    
    if ! command -v eas &> /dev/null; then
        print_status "Installing EAS CLI..."
        npm install -g eas-cli
    fi
    
    local profile=${1:-"preview"}
    
    print_status "Building with EAS profile: $profile"
    eas build --platform all --profile $profile
    
    if [ "$profile" == "production" ]; then
        print_status "Submitting to app stores..."
        eas submit --platform all --profile production
    fi
    
    print_success "EAS deployment completed"
}

# Create GitHub release
create_github_release() {
    local version=$1
    
    if [ -z "$version" ]; then
        print_error "Version number is required for GitHub release"
        exit 1
    fi
    
    print_status "Creating GitHub release for version $version..."
    
    # Create git tag
    git tag -a "v$version" -m "Release version $version"
    git push origin "v$version"
    
    print_success "GitHub release created for version $version"
}

# Main deployment function
deploy() {
    local environment=$1
    local version=$2
    
    print_status "Starting deployment for environment: $environment"
    
    # Always run these checks
    check_dependencies
    install_dependencies
    run_tests
    run_linting
    run_type_check
    
    case $environment in
        "demo")
            deploy_expo_demo "demo"
            deploy_vercel_demo
            ;;
        "staging")
            deploy_firebase
            deploy_expo_demo "staging"
            deploy_eas "preview"
            ;;
        "production")
            if [ -z "$version" ]; then
                print_error "Version number is required for production deployment"
                exit 1
            fi
            deploy_firebase
            deploy_eas "production"
            create_github_release $version
            ;;
        "android")
            build_android
            ;;
        "ios")
            build_ios
            ;;
        *)
            print_error "Unknown environment: $environment"
            print_status "Available environments: demo, staging, production, android, ios"
            exit 1
            ;;
    esac
    
    print_success "Deployment completed successfully!"
}

# Show usage information
show_usage() {
    echo "FuelFlow Deployment Script"
    echo ""
    echo "Usage: $0 <environment> [version]"
    echo ""
    echo "Environments:"
    echo "  demo        - Deploy demo to Expo and Vercel"
    echo "  staging     - Deploy to staging environment"
    echo "  production  - Deploy to production (requires version)"
    echo "  android     - Build Android APK"
    echo "  ios         - Build iOS archive"
    echo ""
    echo "Examples:"
    echo "  $0 demo"
    echo "  $0 staging"
    echo "  $0 production 1.0.0"
    echo "  $0 android"
    echo "  $0 ios"
    echo ""
}

# Main script execution
main() {
    if [ $# -eq 0 ]; then
        show_usage
        exit 1
    fi
    
    local environment=$1
    local version=$2
    
    case $environment in
        "-h"|"--help"|"help")
            show_usage
            exit 0
            ;;
        *)
            deploy $environment $version
            ;;
    esac
}

# Run main function with all arguments
main "$@"