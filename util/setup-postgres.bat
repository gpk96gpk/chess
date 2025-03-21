@echo off
:: PostgreSQL Setup Script for Chess Application
:: Save this as setup-postgres.bat

echo PostgreSQL Setup Script for Chess Application
echo ===========================================
echo.

:: Check for administrator privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Please run this script as Administrator
    echo Right-click the script and select "Run as administrator"
    pause
    exit /b 1
)

:: Check if PostgreSQL is installed
where psql >nul 2>&1
if %errorlevel% neq 0 (
    echo PostgreSQL is not installed or not in your PATH.
    echo Please install PostgreSQL from https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo PostgreSQL is installed. Checking service...

:: Check if PostgreSQL service is running
sc query postgresql | findstr "RUNNING" >nul
if %errorlevel% neq 0 (
    echo Starting PostgreSQL service...
    net start postgresql
    if %errorlevel% neq 0 (
        echo Failed to start PostgreSQL service.
        echo Please check your installation.
        pause
        exit /b 1
    )
)
echo PostgreSQL service is running.

echo.
echo Creating database and tables...

:: Get credentials from environment variables or use defaults
set PGUSER=postgres
set PGHOST=localhost
set PGPASSWORD=password
set PGDATABASE=chess

:: Create the database if it doesn't exist
psql -U %PGUSER% -h %PGHOST% -c "SELECT 1 FROM pg_database WHERE datname = 'chess'" | findstr 1 >nul
if %errorlevel% neq 0 (
    echo Creating database 'chess'...
    psql -U %PGUSER% -h %PGHOST% -c "CREATE DATABASE chess"
) else (
    echo Database 'chess' already exists.
)

:: Create tables from the SQL file
echo Creating tables...
psql -U %PGUSER% -h %PGHOST% -d chess -f "%~dp0..\server\src\db\db.sql"

:: Test the connection
echo.
echo Testing database connection...
psql -U %PGUSER% -h %PGHOST% -d chess -c "SELECT 'Connection successful!' as status;"

echo.
echo Setup complete! Your PostgreSQL database is ready for the chess application.
echo.
echo Database connection details:
echo Host: %PGHOST%
echo Port: 5432
echo Database: %PGDATABASE%
echo User: %PGUSER%
echo.
echo These settings should match your .env file:
echo PGUSER=%PGUSER%
echo PGHOST=%PGHOST%
echo PGPASSWORD=[your-password]
echo PGDATABASE=%PGDATABASE%
echo PGPORT=5432
echo.

pause