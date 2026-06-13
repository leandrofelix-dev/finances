#!/usr/bin/env bash

# Simple PostgreSQL backup script for the Finances project
# Usage: npm run backup
# Load environment variables from .env if present
if [ -f .env ]; then export $(grep -v '^#' .env | xargs); fi
# It assumes the DATABASE_URL env variable is set (as in .env)

set -euo pipefail

# Extract connection parameters from DATABASE_URL
# Expected format: postgres://USER:PASSWORD@HOST:PORT/DATABASE
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Error: DATABASE_URL is not set in the environment." >&2
  exit 1
fi

# Ensure dump directory exists
mkdir -p dump
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUTPUT_FILE="dump/backup_${TIMESTAMP}.sql"

# pg_dump will read DATABASE_URL automatically if passed with --dbname
pg_dump --no-owner --no-privileges --format=plain --no-comments --dbname="${DATABASE_URL%%\?*}" > "$OUTPUT_FILE"

echo "Backup completed: $OUTPUT_FILE"
