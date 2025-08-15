
#!/bin/bash

# Multi-Agent Program Management MVP - Local Setup Script
set -e

echo "🚀 Setting up Multi-Agent Program Management MVP locally..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the app directory"
    exit 1
fi

# Step 1: Copy environment file if it doesn't exist
echo "📄 Setting up environment variables..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "⚠️  Please edit .env file with your actual database URL and API keys"
else
    echo "✅ .env file already exists"
fi

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Step 3: Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

# Step 4: Push database schema (for development)
echo "📊 Setting up database schema..."
if npx prisma db push; then
    echo "✅ Database schema pushed successfully"
else
    echo "❌ Database schema push failed. Please check your DATABASE_URL in .env"
    echo "💡 Make sure your PostgreSQL database is running and accessible"
fi

# Step 5: Seed the database
echo "🌱 Seeding database with initial data..."
if npm run seed 2>/dev/null || npx prisma db seed; then
    echo "✅ Database seeded successfully"
else
    echo "⚠️  Database seeding failed or no seed script found"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env file with your actual database URL and API keys"
echo "  2. Run 'yarn dev' to start the development server"
echo "  3. Open http://localhost:3000 in your browser"
echo ""
echo "Available scripts:"
echo "  yarn dev          - Start development server"
echo "  yarn build        - Build for production"
echo "  yarn start        - Start production server"
echo "  yarn lint         - Run ESLint"
echo "  npx prisma studio - Open database browser"
echo "  npx prisma db push - Push schema changes to database"
echo ""
