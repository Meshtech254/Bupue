#!/bin/bash

# Bupue Backend Deployment Script
echo "🚀 Starting Bupue Backend Deployment..."

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please run this script from the project root."
    exit 1
fi

# Check if backend directory exists
if [ ! -d "bupue-backend" ]; then
    echo "❌ Error: bupue-backend directory not found."
    exit 1
fi

# Check if package.json exists
if [ ! -f "bupue-backend/package.json" ]; then
    echo "❌ Error: bupue-backend/package.json not found."
    exit 1
fi

echo "✅ Project structure verified"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Git repository not initialized. Please run:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

echo "✅ Git repository found"

# Check if remote is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  Warning: No remote origin found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/yourusername/yourrepo.git"
    echo "   git push -u origin main"
    exit 1
fi

echo "✅ Remote origin configured"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes. Please commit them first:"
    echo "   git add ."
    echo "   git commit -m 'Update for deployment'"
    echo "   git push"
    exit 1
fi

echo "✅ All changes committed"

# Display deployment instructions
echo ""
echo "🎯 Deployment Instructions:"
echo "=========================="
echo ""
echo "1. Push your code to GitHub:"
echo "   git push origin main"
echo ""
echo "2. Go to Render Dashboard: https://dashboard.render.com"
echo ""
echo "3. Click 'New +' and select 'Blueprint'"
echo ""
echo "4. Connect your GitHub repository"
echo ""
echo "5. Render will automatically detect render.yaml"
echo ""
echo "6. Set up environment variables in Render:"
echo "   - NODE_ENV=production"
echo "   - PORT=10000"
echo "   - MONGODB_URI=your-mongodb-connection-string"
echo "   - JWT_SECRET=your-jwt-secret"
echo "   - EMAIL_USER=your-email"
echo "   - EMAIL_PASS=your-email-password"
echo "   - EMAIL_FROM=your-email"
echo "   - CORS_ORIGIN=your-frontend-url"
echo ""
echo "7. Deploy and test the health endpoint:"
echo "   https://your-app.onrender.com/api/health"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "✅ Deployment script completed!"
