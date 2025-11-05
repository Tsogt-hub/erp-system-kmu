#!/bin/bash

echo "🚀 ERP System KMU - Setup Script"
echo "=================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start Docker services
echo "📦 Starting Docker services (PostgreSQL, Redis)..."
cd "$(dirname "$0")/.."
docker-compose -f docker/docker-compose.yml up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

cd ..

echo ""
echo "✅ Setup completed!"
echo ""
echo "📝 Next steps:"
echo "1. Copy backend/.env.example to backend/.env and configure it"
echo "2. Run 'npm run dev' in the backend directory"
echo "3. Run 'npm run dev' in the frontend directory"
echo ""
echo "🌐 Frontend will be available at: http://localhost:5173"
echo "🔧 Backend API will be available at: http://localhost:3000"







