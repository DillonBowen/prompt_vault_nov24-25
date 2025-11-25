#!/bin/bash

# Function to kill processes on exit
cleanup() {
    echo "Shutting down..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

echo "🚀 Starting Prompt Vault..."

# Start Backend
echo "📦 Starting Backend Server (Port 3001)..."
cd server
node server.js &
cd ..

# Wait a moment for backend to initialize
sleep 2

# Start Frontend
echo "🎨 Starting Frontend (Vite)..."
npm run dev

# Keep script running
wait
