#!/bin/bash
# Build script for Render deployment

echo "🚀 Starting build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create uploads directory if it doesn't exist
echo "📁 Creating uploads directory..."
mkdir -p uploads

echo "✅ Build process completed!"