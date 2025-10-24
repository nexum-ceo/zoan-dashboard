#!/bin/sh
set -e

echo "🏗️ Injecting runtime environment variables..."

# Ensure we're in the correct directory and have permissions
cd /app || cd /usr/src/app || pwd
echo "Current directory: $(pwd)"

# Create .env.local with proper permissions
touch .env.local 2>/dev/null || {
    echo "⚠️ Cannot create .env.local in current directory, trying alternative approach..."
    # Try to create in a writable location
    mkdir -p /tmp/env
    touch /tmp/env/.env.local
    chmod 644 /tmp/env/.env.local
    export ENV_FILE_PATH="/tmp/env/.env.local"
}

# Set proper permissions if file was created successfully
if [ -f .env.local ]; then
    chmod 644 .env.local
    export ENV_FILE_PATH=".env.local"
elif [ -f /tmp/env/.env.local ]; then
    export ENV_FILE_PATH="/tmp/env/.env.local"
fi

# Write all NEXT_PUBLIC_* environment variables to .env.local
printenv | grep ^NEXT_PUBLIC_ > "$HOME/.env.local"
export ENV_FILE_PATH="$HOME/.env.local"

echo "✅ Environment variables written to ${ENV_FILE_PATH:-.env.local}:"

echo "🚀 Starting Next.js server..."
exec node server.js
