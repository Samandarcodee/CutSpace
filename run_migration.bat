@echo off
REM Run this script to apply the migration to your Neon database on Windows
REM Usage: run_migration.bat YOUR_NEON_DATABASE_URL

if "%1"=="" (
  echo Usage: run_migration.bat ^<database_url^>
  echo Example: run_migration.bat postgresql://user:password@host/database
  exit /b 1
)

set DATABASE_URL=%1

echo Running migration...
psql "%DATABASE_URL%" -f add_description_column_migration.sql

if %ERRORLEVEL% EQU 0 (
  echo ✅ Migration completed successfully!
) else (
  echo ❌ Migration failed. Please check the error message above.
  exit /b 1
)

