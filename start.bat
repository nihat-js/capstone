@echo off
echo 🍯 Starting Honeypot Management Platform...

echo 🔧 Installing Backend Dependencies...
cd backend
pip install -r requirements.txt
cd ..

echo 🎨 Installing Frontend Dependencies...
cd frontend
npm install
cd ..

echo 🔧 Starting Flask Backend API...
cd backend
start "Flask Backend" python app.py
cd ..

echo 🎨 Starting Next.js Frontend...
cd frontend
start "Next.js Frontend" npm run dev
cd ..

echo.
echo 🎉 Honeypot Management Platform is starting up!
echo.
echo 📊 Frontend Dashboard: http://localhost:3000
echo 🔧 Backend API: http://localhost:5000
echo.
echo 📁 Logs are stored in: .\logs\
echo 📜 Scripts are stored in: .\scripts\
echo.
echo Press any key to exit...
pause >nul
