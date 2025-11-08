#!/bin/bash

# Database Setup Script
# Bu script database'ni sozlash va tekshirish uchun

echo "🔧 Toshkent Sartarosh - Database Setup"
echo "======================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env fayli topilmadi!"
    echo "📝 .env.example dan nusxa olinmoqda..."
    cp .env.example .env
    echo "✅ .env fayli yaratildi"
    echo ""
    echo "❗ MUHIM: .env faylida DATABASE_URL va TELEGRAM_BOT_TOKEN ni o'rnating!"
    echo ""
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL o'rnatilmagan!"
    echo "📝 .env faylida DATABASE_URL ni o'rnating"
    echo ""
    echo "Misol:"
    echo "DATABASE_URL=postgresql://user:password@host/database?sslmode=require"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL topildi"
echo "📦 Connection: ${DATABASE_URL:0:30}..."
echo ""

# Run migrations
echo "🔧 Database migrations ishga tushirilmoqda..."
npm run db:migrate

if [ $? -eq 0 ]; then
    echo "✅ Migrations muvaffaqiyatli!"
    echo ""
else
    echo "❌ Migrations xato!"
    exit 1
fi

# Run seed
echo "🌱 Database seed ishga tushirilmoqda..."
npm run db:seed

if [ $? -eq 0 ]; then
    echo "✅ Seed muvaffaqiyatli!"
    echo ""
else
    echo "⚠️  Seed xato (bu normal bo'lishi mumkin agar data mavjud bo'lsa)"
    echo ""
fi

echo "🎉 Database setup complete!"
echo ""
echo "✅ Endi serverni ishga tushirishingiz mumkin:"
echo "   npm run dev"
echo ""
