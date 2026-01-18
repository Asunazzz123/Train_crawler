LOG_DIR := log


build:
	@npm run build
ifeq ($(OS),Windows_NT)

run:
	@powershell -NoProfile -File scripts/run.ps1

kill:
	@powershell -NoProfile -File scripts/kill.ps1

else
SHELL := /bin/bash

run:
	@mkdir -p "$(LOG_DIR)"
	@NO_COLOR=1 npm run dev > "$(LOG_DIR)/frontend.log" 2>&1 & echo $$! > "$(LOG_DIR)/frontend.pid"
	@. "$$(conda info --base)/etc/profile.d/conda.sh" && conda activate dl && NO_COLOR=1 python "backend/app.py" > "$(LOG_DIR)/backend.log" 2>&1 & echo $$! > "$(LOG_DIR)/backend.pid"

kill:
	@if [ -f "$(LOG_DIR)/frontend.pid" ]; then kill $$(cat "$(LOG_DIR)/frontend.pid") 2>/dev/null || true; rm -f "$(LOG_DIR)/frontend.pid"; fi
	@if [ -f "$(LOG_DIR)/backend.pid" ]; then kill $$(cat "$(LOG_DIR)/backend.pid") 2>/dev/null || true; rm -f "$(LOG_DIR)/backend.pid"; fi
endif

.PHONY: run kill
