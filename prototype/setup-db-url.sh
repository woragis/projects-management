#!/bin/bash

# Railway database connection details
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="fYpUiNYTWrWlfwBqlKxMmdVirHzSEcXm"
PGDATABASE="railway"
# Use public proxy for local connections (from outside Railway)
RAILWAY_TCP_PROXY_DOMAIN="hopper.proxy.rlwy.net"
RAILWAY_TCP_PROXY_PORT="35878"

# Construct DATABASE_URL using public proxy (for local dev)
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${RAILWAY_TCP_PROXY_DOMAIN}:${RAILWAY_TCP_PROXY_PORT}/${PGDATABASE}"

# .env file path
ENV_FILE=".env"

# Backup existing .env if it exists
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "${ENV_FILE}.backup"
    echo "Backed up existing .env to .env.backup"
fi

# Remove old DATABASE_URL if exists and add new one
if [ -f "$ENV_FILE" ]; then
    # Remove old DATABASE_URL lines
    sed -i '/^DATABASE_URL=/d' "$ENV_FILE"
fi

# Add new DATABASE_URL
echo "DATABASE_URL=\"${DATABASE_URL}\"" >> "$ENV_FILE"

echo "✓ Added DATABASE_URL to .env file"
echo "DATABASE_URL has been set"
