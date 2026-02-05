#!/bin/bash
# Script to deploy matchmaking edge functions

echo "🚀 Deploying Matchmaking Edge Functions"
echo "========================================="
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install with:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if project is linked
if [ ! -f .supabase/config.toml ]; then
    echo "⚠️  Project not linked. Run:"
    echo "   supabase link --project-ref YOUR_PROJECT_REF"
    echo ""
    read -p "Do you want to link now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your project ref: " PROJECT_REF
        supabase link --project-ref $PROJECT_REF
    else
        exit 1
    fi
fi

echo "📦 Deploying functions..."
echo ""

# Deploy matchmake
echo "1️⃣  Deploying matchmake..."
supabase functions deploy matchmake
if [ $? -eq 0 ]; then
    echo "   ✅ matchmake deployed"
else
    echo "   ❌ matchmake deployment failed"
fi

echo ""

# Deploy create-swipe
echo "2️⃣  Deploying create-swipe..."
supabase functions deploy create-swipe
if [ $? -eq 0 ]; then
    echo "   ✅ create-swipe deployed"
else
    echo "   ❌ create-swipe deployment failed"
fi

echo ""

# Deploy ai-summary
echo "3️⃣  Deploying ai-summary..."
supabase functions deploy ai-summary
if [ $? -eq 0 ]; then
    echo "   ✅ ai-summary deployed"
else
    echo "   ❌ ai-summary deployment failed"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Verify functions:"
echo "   supabase functions list"
echo ""
echo "🔧 Set environment variables in Supabase Dashboard:"
echo "   Edge Functions > Settings > Environment Variables"
echo "   - OPENAI_API_KEY (optional, for AI summaries)"

