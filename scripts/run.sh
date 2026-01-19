#!/bin/bash
set -euo pipefail

LOG_DIR="${LOG_DIR:-log}"
mkdir -p "$LOG_DIR"
CONDA_ENV="dl"
# frontend
NO_COLOR=1 npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
echo $! > "$LOG_DIR/frontend.pid"

# backend
CONDA_BASE="$(conda info --base 2>/dev/null || true)"
if [ -n "$CONDA_BASE" ] && [ -f "$CONDA_BASE/etc/profile.d/conda.sh" ]; then
  . "$CONDA_BASE/etc/profile.d/conda.sh"
fi
conda activate "$CONDA_ENV" 2>/dev/null || true
TERM=dumb NO_COLOR=1 PYTHONUNBUFFERED=1 python "backend/app.py" > "$LOG_DIR/backend.log" 2>&1 &
echo $! > "$LOG_DIR/backend.pid"

echo "started frontend(pid=$(cat "$LOG_DIR/frontend.pid")) backend(pid=$(cat "$LOG_DIR/backend.pid"))"