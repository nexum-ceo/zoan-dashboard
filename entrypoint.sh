#!/bin/sh
set -e

echo "🏗️ Injecting runtime environment variables..."

# Ensure we have permission to create .env.local file
touch .env.local
chmod 644 .env.local

# Ghi tất cả biến môi trường NEXT_PUBLIC_* vào file .env.local

printenv | grep ^NEXT_PUBLIC_ > .env.local

echo "✅ Environment variables written to .env.local:"
cat .env.local

echo "🚀 Starting Next.js server..."
exec node server.js
