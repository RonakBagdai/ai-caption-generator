#!/bin/bash

# 🚀 AI Caption Generator - GitHub Repository Setup Script
# This script will push your project to GitHub after you create the repository

echo "🤖 AI Caption Generator - Repository Setup"
echo "========================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please run this script from the project root."
    exit 1
fi

echo "📋 Current project status:"
echo "✅ Git repository: Initialized"
echo "✅ Files committed: $(git rev-list --all --count 2>/dev/null || echo '0') commits"
echo "✅ Branch: $(git branch --show-current)"
echo ""

echo "🔗 To complete the GitHub setup:"
echo ""
echo "1. Go to https://github.com/new"
echo "2. Repository name: ai-caption-generator"
echo "3. Description: AI-powered social media caption generator with multi-language support"
echo "4. Choose Public/Private"
echo "5. DON'T initialize with README"
echo "6. Click 'Create repository'"
echo ""

read -p "✅ Have you created the GitHub repository? (y/n): " created

if [ "$created" = "y" ] || [ "$created" = "Y" ]; then
    echo ""
    read -p "🔗 Enter your GitHub username: " username
    
    if [ -z "$username" ]; then
        echo "❌ Username cannot be empty"
        exit 1
    fi
    
    REPO_URL="https://github.com/$username/ai-caption-generator.git"
    
    echo "🚀 Setting up remote repository..."
    
    # Add remote origin
    git remote add origin "$REPO_URL" 2>/dev/null || {
        echo "🔄 Remote origin already exists, updating..."
        git remote set-url origin "$REPO_URL"
    }
    
    echo "📤 Pushing to GitHub..."
    
    if git push -u origin main; then
        echo ""
        echo "🎉 SUCCESS! Your repository has been created and pushed to GitHub!"
        echo ""
        echo "🔗 Repository URL: https://github.com/$username/ai-caption-generator"
        echo "👀 You can view it at: https://github.com/$username/ai-caption-generator"
        echo ""
        echo "📊 Repository includes:"
        echo "   📁 Complete full-stack application"
        echo "   📖 Professional README with setup instructions"
        echo "   🤝 Contributing guidelines"
        echo "   📄 MIT License"
        echo "   🔧 Environment configuration examples"
        echo "   📱 Mobile-responsive design"
        echo "   🔐 JWT authentication system"
        echo "   🤖 AI-powered caption generation"
        echo "   🌍 Multi-language support (12 languages)"
        echo "   📦 Batch image processing"
        echo "   🎨 Dark/Light theme support"
        echo ""
        echo "🚀 Next steps:"
        echo "   1. Update the repository description on GitHub"
        echo "   2. Add topics/tags for better discoverability"
        echo "   3. Consider adding screenshots to the README"
        echo "   4. Set up GitHub Actions for CI/CD (optional)"
        echo ""
        echo "⭐ Don't forget to star your own repository!"
        
    else
        echo "❌ Failed to push to GitHub. Please check:"
        echo "   - Repository exists and is accessible"
        echo "   - You have push permissions"
        echo "   - Your GitHub credentials are configured"
        echo ""
        echo "💡 You can try manually:"
        echo "   git remote -v  # Check remote URL"
        echo "   git push -u origin main  # Push again"
    fi
    
else
    echo ""
    echo "📝 Manual setup instructions:"
    echo ""
    echo "After creating the GitHub repository, run:"
    echo ""
    echo "git remote add origin https://github.com/YOUR_USERNAME/ai-caption-generator.git"
    echo "git push -u origin main"
    echo ""
    echo "Replace YOUR_USERNAME with your actual GitHub username."
fi

echo ""
echo "📞 Need help? Check the CONTRIBUTING.md file for detailed instructions!"
