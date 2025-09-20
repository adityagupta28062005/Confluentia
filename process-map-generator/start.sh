#!/bin/bash

echo "🚀 Starting Process Map Generator Application"
echo "============================================"

# Check if MongoDB is running
echo "📊 Checking MongoDB connection..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   brew services start mongodb/brew/mongodb-community"
    echo "   or"
    echo "   mongod --dbpath /usr/local/var/mongodb"
    exit 1
fi

# Check for environment variables
if [ ! -f "server/.env" ]; then
    echo "⚠️  Environment file not found. Creating template..."
    cat > server/.env << EOL
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/process-map-generator
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:3000
EOL
    echo "📝 Please update server/.env with your OpenAI API key"
    exit 1
fi

# Start backend
echo "🔧 Starting backend server..."
cd server
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Start frontend
echo "🎨 Starting frontend..."
cd client
npm start &
FRONTEND_PID=$!
cd ..

echo "✅ Application started successfully!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5000"
echo "📊 MongoDB:  mongodb://localhost:27017"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script termination
trap cleanup SIGINT SIGTERM

# Wait for processes
wait