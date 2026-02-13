#!/bin/bash
echo "🧹 Complete Metro Cache Clear"
echo "============================="
echo ""
killall node 2>/dev/null || true
sleep 2
rm -rf node_modules/.cache
rm -rf .expo
rm -rf .metro
rm -rf .expo-shared
rm -rf .expo/types
mkdir -p .expo/types
echo "// Expo Router type definitions" > .expo/types/router.d.ts
echo ""
echo "✅ All caches cleared!"
echo ""
echo "Now run: npx expo start --clear"
