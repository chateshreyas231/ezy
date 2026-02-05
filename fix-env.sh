#!/bin/bash
# Fix .env file by removing leading spaces

echo "Fixing .env file..."

# Create backup
cp .env .env.backup

# Remove leading spaces and empty lines, then write to temp file
sed 's/^[[:space:]]*//' .env.backup | grep -v '^$' > .env.tmp

# Move temp file to .env
mv .env.tmp .env

echo "✅ .env file fixed!"
echo "Backup saved as .env.backup"
echo ""
echo "Your .env file should now look like:"
echo "EXPO_PUBLIC_SUPABASE_URL=https://..."
echo "EXPO_PUBLIC_SUPABASE_KEY=eyJ..."
echo ""
echo "⚠️  IMPORTANT: Restart Expo server after fixing .env file!"
echo "   Run: npm start"

