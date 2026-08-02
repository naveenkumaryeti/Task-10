#!/usr/bin/env bash
# Run the full QuikKart stack locally in one command using Docker Compose.
set -e

echo "🚀 Starting QuikKart (frontend + backend + MySQL) locally..."
docker compose up --build -d

echo ""
echo "⏳ Waiting for services to become healthy..."
sleep 8

echo ""
echo "✅ QuikKart is running:"
echo "   Website:      http://localhost:8080"
echo "   Admin Portal: http://localhost:8080/admin-login.html"
echo "   Backend API:  http://localhost:3000/api"
echo ""
echo "   Admin login -> admin@quikkart.com / Admin@123"
echo ""
echo "Stop everything with: docker compose down"
