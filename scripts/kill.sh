#!/bin/bash
FRONTEND_PORT=5173
BACKEND_PORT=5001
LOG_DIR="${LOG_DIR:-log}"
mkdir -p "$LOG_DIR"
if [ -f "$LOG_DIR/frontend.pid" ]; then
kill $(cat "$LOG_DIR/frontend.pid") 2>/dev/null || true; 
rm -f "$LOG_DIR/frontend.pid"; 
elif [ -n "$(lsof -t -i:$FRONTEND_PORT)" ]; then
kill -9 $(lsof -t -i:$FRONTEND_PORT) 2>/dev/null || true;
else 
echo "No frontend process found."
fi

if [ -f "$LOG_DIR/backend.pid" ]; then 
kill $(cat "$LOG_DIR/backend.pid") 2>/dev/null || true;
rm -f "$LOG_DIR/backend.pid"; 
elif [ -n "$(lsof -t -i:$BACKEND_PORT)" ]; then
kill -9 $(lsof -t -i:$BACKEND_PORT) 2>/dev/null || true;
else
echo "No backend process found."
fi