#!/bin/bash

echo "🚀 Audio Collection Platform Deployment Script"
echo "=============================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <your-github-repo-url>"
    echo "   git push -u origin main"
    exit 1
fi

# Check if changes are committed
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Please commit them first:"
    echo "   git add ."
    echo "   git commit -m 'Prepare for deployment'"
    echo "   git push"
    exit 1
fi

echo "✅ Code is ready for deployment!"
echo ""

echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. 🚂 Deploy Backend to Railway:"
echo "   - Go to https://railway.app"
echo "   - Create new project"
echo "   - Connect your GitHub repo"
echo "   - Set root directory to './server'"
echo "   - Add environment variables:"
echo "     AGORA_APP_ID=your_agora_app_id"
echo "     AGORA_APP_CERTIFICATE=your_agora_certificate"
echo "     PORT=5001"
echo "     NODE_ENV=production"
echo ""
echo "2. 🌐 Deploy Frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Create new project"
echo "   - Import your GitHub repo"
echo "   - Set root directory to './client'"
echo "   - Add environment variable:"
echo "     REACT_APP_SERVER_URL=https://your-railway-app-url.railway.app"
echo ""
echo "3. 🎤 Test Your Deployment:"
echo "   - Open your Vercel URL on two devices"
echo "   - Test real-time audio communication"
echo "   - Test recording functionality"
echo "   - Verify HTTPS is working"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""
echo "🎉 Good luck with your deployment!"
