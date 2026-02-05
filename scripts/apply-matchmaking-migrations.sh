#!/bin/bash
# Script to help apply matchmaking migrations
# This opens Supabase SQL Editor with migration content

echo "🚀 Matchmaking Migration Helper"
echo "================================"
echo ""
echo "This script will help you apply migrations via Supabase SQL Editor."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it with:"
    echo "   EXPO_PUBLIC_SUPABASE_URL=your_url"
    echo "   EXPO_PUBLIC_SUPABASE_KEY=your_key"
    exit 1
fi

# Extract project URL from .env
SUPABASE_URL=$(grep EXPO_PUBLIC_SUPABASE_URL .env | cut -d '=' -f2 | tr -d ' ' | tr -d '"')
if [ -z "$SUPABASE_URL" ]; then
    echo "❌ Could not find EXPO_PUBLIC_SUPABASE_URL in .env"
    exit 1
fi

# Extract project ref from URL
PROJECT_REF=$(echo $SUPABASE_URL | sed 's|https://||' | sed 's|\.supabase\.co||')
echo "📋 Project: $PROJECT_REF"
echo ""

# Create combined migration file
COMBINED_FILE="database/migrations/COMBINED_MATCHMAKING_MIGRATIONS.sql"
echo "-- Combined Matchmaking Migrations" > $COMBINED_FILE
echo "-- Apply this entire file in Supabase SQL Editor" >> $COMBINED_FILE
echo "-- Generated: $(date)" >> $COMBINED_FILE
echo "" >> $COMBINED_FILE
echo "-- ============================================================" >> $COMBINED_FILE
echo "-- MIGRATION 016: Matchmaking Schema" >> $COMBINED_FILE
echo "-- ============================================================" >> $COMBINED_FILE
cat database/migrations/016_matchmaking_schema.sql >> $COMBINED_FILE
echo "" >> $COMBINED_FILE
echo "-- ============================================================" >> $COMBINED_FILE
echo "-- MIGRATION 017: RLS Policies" >> $COMBINED_FILE
echo "-- ============================================================" >> $COMBINED_FILE
cat database/migrations/017_matchmaking_rls.sql >> $COMBINED_FILE
echo "" >> $COMBINED_FILE
echo "-- ============================================================" >> $COMBINED_FILE
echo "-- MIGRATION 018: Migrate Existing Data (OPTIONAL)" >> $COMBINED_FILE
echo "-- ============================================================" >> $COMBINED_FILE
echo "-- Only run this if you have existing data in old schema" >> $COMBINED_FILE
echo "-- Uncomment below to run:" >> $COMBINED_FILE
echo "--" >> $COMBINED_FILE
cat database/migrations/018_migrate_existing_data.sql | sed 's/^/-- /' >> $COMBINED_FILE

echo "✅ Combined migration file created: $COMBINED_FILE"
echo ""
echo "📝 Next steps:"
echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
echo "2. Copy the contents of: $COMBINED_FILE"
echo "3. Paste into SQL Editor"
echo "4. Click 'Run'"
echo ""
echo "Or open the file:"
echo "   cat $COMBINED_FILE"
echo ""

# Try to open browser (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    SQL_EDITOR_URL="https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
    echo "🌐 Opening SQL Editor in browser..."
    open "$SQL_EDITOR_URL" 2>/dev/null || echo "   (Could not open browser automatically)"
fi

