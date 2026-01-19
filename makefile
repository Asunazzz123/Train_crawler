LOG_DIR := log

install:
	@npm install
	
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
	@bash scripts/run.sh
kill:
	@bash scripts/kill.sh
endif

.PHONY: run kill
