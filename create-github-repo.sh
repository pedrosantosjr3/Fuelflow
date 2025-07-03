#!/bin/bash

# FuelFlow GitHub Repository Setup Script

echo "🚀 Setting up FuelFlow GitHub repository..."

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: FuelFlow - On-demand fuel delivery app

🚀 Features:
- React Native mobile app with TypeScript
- Firebase backend integration
- Stripe payment processing
- Google Maps location services
- Comprehensive test suite
- CI/CD pipeline with GitHub Actions
- Demo deployment ready

🎯 Ready for partner presentations and development"

echo "✅ Local git repository created!"
echo ""
echo "📋 Next steps:"
echo "1. Create repository on GitHub.com:"
echo "   - Go to https://github.com/new"
echo "   - Repository name: fuelflow"
echo "   - Description: On-demand fuel delivery mobile application"
echo "   - Set to Public"
echo "   - Click 'Create repository'"
echo ""
echo "2. Connect and push:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/fuelflow.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Enable GitHub Pages:"
echo "   - Go to repository Settings > Pages"
echo "   - Source: Deploy from a branch"
echo "   - Branch: main / demo folder"
echo "   - Your demo will be at: https://YOUR_USERNAME.github.io/fuelflow"