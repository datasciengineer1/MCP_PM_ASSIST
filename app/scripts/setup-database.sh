
#!/bin/bash

# Database setup script for Multi-Agent Program Management MVP
set -e

echo "🗄️  Setting up database for Multi-Agent Program Management MVP..."

# Generate Prisma client
echo "📋 Generating Prisma client..."
npx prisma generate

# Push database schema
echo "📊 Pushing database schema..."
npx prisma db push

# Seed database
echo "🌱 Seeding database..."
if npm run seed 2>/dev/null || npx prisma db seed; then
    echo "✅ Database seeded successfully"
else
    echo "⚠️  Database seeding completed with warnings or no seed script found"
fi

echo "✅ Database setup complete!"
