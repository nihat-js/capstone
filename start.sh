#!/bin/bash

# Honeypot Management Platform Startup Script

echo "🍯 Starting Honeypot Management Platform..."

# Check if we're on Windows or Unix
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    echo "Detected Windows environment"
    
    # Start Backend (Flask API)
    echo "🔧 Starting Flask Backend API..."
    cd backend
    start "Flask Backend" python app.py
    cd ..
    
    # Start Frontend (Next.js)
    echo "🎨 Starting Next.js Frontend..."
    cd frontend
    start "Next.js Frontend" npm run dev
    cd ..
    
else
    # Unix/Linux/macOS
    echo "Detected Unix-like environment"
    
    # Start Backend (Flask API)
    echo "🔧 Starting Flask Backend API..."
    cd backend
    python3 app.py &
    BACKEND_PID=$!
    cd ..
    
    # Start Frontend (Next.js)
    echo "🎨 Starting Next.js Frontend..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Store PIDs for cleanup
    echo $BACKEND_PID > .backend.pid
    echo $FRONTEND_PID > .frontend.pid
fi

echo ""
echo "🎉 Honeypot Management Platform is starting up!"
echo ""
echo "📊 Frontend Dashboard: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo ""
echo "📁 Logs are stored in: ./logs/"
echo "📜 Scripts are stored in: ./scripts/"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt on Unix systems
if [[ "$OSTYPE" != "msys" && "$OSTYPE" != "win32" ]]; then
    trap 'echo "Stopping services..."; kill $BACKEND_PID $FRONTEND_PID; rm -f .backend.pid .frontend.pid; exit 0' INT
    wait
fi
