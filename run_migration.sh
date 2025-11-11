#!/bin/bash
# Run this script to apply the migration to your Neon database
# Usage: ./run_migration.sh YOUR_NEON_DATABASE_URL

if [ -z "$1" ]; then
  echo "Usage: $0 <database_url>"
  echo "Example: $0 postgresql://user:password@host/database"
  exit 1
fi

DATABASE_URL="$1"

echo "Running migration..."
psql "$DATABASE_URL" -f add_description_column_migration.sql

if [ $? -eq 0 ]; then
  echo "✅ Migration completed successfully!"
else
  echo "❌ Migration failed. Please check the error message above."
  exit 1
fi

