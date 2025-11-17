@echo off
REM ###########################################################################
REM Script de Backup do Banco de Dados MySQL (Windows)
REM Realiza backup completo do banco de dados com compressão
REM ###########################################################################

setlocal enabledelayedexpansion

REM Configurações (substituir com valores reais ou usar variáveis de ambiente)
if "%DB_HOST%"=="" set DB_HOST=localhost
if "%DB_PORT%"=="" set DB_PORT=3306
if "%DB_NAME%"=="" set DB_NAME=ecommerce
if "%DB_USER%"=="" set DB_USER=root

REM Diretório de backup
if "%BACKUP_DIR%"=="" set BACKUP_DIR=.\backups\database
set TIMESTAMP=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FILE=%BACKUP_DIR%\backup_%DB_NAME%_%TIMESTAMP%.sql

REM Número de dias para manter backups
if "%BACKUP_RETENTION_DAYS%"=="" set BACKUP_RETENTION_DAYS=30

echo ========================================
echo Script de Backup do Banco de Dados
echo ========================================
echo.

REM Cria diretório de backup se não existir
if not exist "%BACKUP_DIR%" (
    echo [INFO] Criando diretorio de backup: %BACKUP_DIR%
    mkdir "%BACKUP_DIR%"
)

REM Verifica se mysqldump existe
where mysqldump >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] mysqldump nao encontrado. Instale o MySQL client.
    exit /b 1
)

REM Realiza o backup
echo [INFO] Iniciando backup do banco de dados: %DB_NAME%
echo [INFO] Arquivo de destino: %BACKUP_FILE%

if "%DB_PASSWORD%"=="" (
    mysqldump --host=%DB_HOST% --port=%DB_PORT% --user=%DB_USER% --single-transaction --routines --triggers --events %DB_NAME% > "%BACKUP_FILE%"
) else (
    mysqldump --host=%DB_HOST% --port=%DB_PORT% --user=%DB_USER% --password=%DB_PASSWORD% --single-transaction --routines --triggers --events %DB_NAME% > "%BACKUP_FILE%"
)

if %ERRORLEVEL% EQU 0 (
    echo [INFO] Backup concluido com sucesso!
    
    REM Lista tamanho do arquivo
    for %%A in ("%BACKUP_FILE%") do echo [INFO] Tamanho: %%~zA bytes
    
    REM Compacta o backup (opcional, requer 7-Zip ou similar)
    where 7z >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo [INFO] Compactando backup...
        7z a -tgzip "%BACKUP_FILE%.gz" "%BACKUP_FILE%" >nul
        if %ERRORLEVEL% EQU 0 (
            del "%BACKUP_FILE%"
            echo [INFO] Backup compactado: %BACKUP_FILE%.gz
        )
    )
) else (
    echo [ERROR] Falha ao criar backup!
    exit /b 1
)

REM Remove backups antigos
echo [INFO] Removendo backups com mais de %BACKUP_RETENTION_DAYS% dias...
forfiles /p "%BACKUP_DIR%" /m backup_%DB_NAME%_*.sql* /d -%BACKUP_RETENTION_DAYS% /c "cmd /c del @path" 2>nul

REM Lista backups existentes
echo.
echo [INFO] Backups existentes:
dir /b "%BACKUP_DIR%\backup_%DB_NAME%_*.sql*" 2>nul || echo Nenhum backup encontrado

echo.
echo ========================================
echo Backup Concluido
echo ========================================

exit /b 0
