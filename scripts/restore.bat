@echo off
REM ###########################################################################
REM Script de Restauração do Banco de Dados MySQL (Windows)
REM Restaura um backup do banco de dados
REM ###########################################################################

setlocal enabledelayedexpansion

REM Configurações
if "%DB_HOST%"=="" set DB_HOST=localhost
if "%DB_PORT%"=="" set DB_PORT=3306
if "%DB_NAME%"=="" set DB_NAME=ecommerce
if "%DB_USER%"=="" set DB_USER=root
if "%BACKUP_DIR%"=="" set BACKUP_DIR=.\backups\database

echo ========================================
echo Script de Restauracao do Banco de Dados
echo ========================================
echo.

REM Lista backups disponíveis
echo [INFO] Backups disponiveis:
echo.
dir /b "%BACKUP_DIR%\backup_%DB_NAME%_*.sql*" 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Nenhum backup encontrado em %BACKUP_DIR%
    exit /b 1
)

echo.
set /p BACKUP_FILE="Digite o nome completo do arquivo de backup: "

REM Verifica se o arquivo existe
if not exist "%BACKUP_DIR%\%BACKUP_FILE%" (
    echo [ERROR] Arquivo nao encontrado: %BACKUP_DIR%\%BACKUP_FILE%
    exit /b 1
)

REM Confirmação
echo.
echo [WARN] ATENCAO: Esta operacao ira SOBRESCREVER o banco de dados atual!
echo [WARN] Banco de dados: %DB_NAME%
echo [WARN] Backup: %BACKUP_FILE%
echo.
set /p CONFIRM="Tem certeza que deseja continuar? (Digite SIM para confirmar): "

if /i not "%CONFIRM%"=="SIM" (
    echo [INFO] Restauracao cancelada pelo usuario
    exit /b 0
)

REM Cria backup de segurança
echo.
echo [INFO] Criando backup de seguranca antes da restauracao...
set SAFETY_BACKUP=safety_backup_%DB_NAME%_%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%.sql
set SAFETY_BACKUP=%SAFETY_BACKUP: =0%

if "%DB_PASSWORD%"=="" (
    mysqldump --host=%DB_HOST% --port=%DB_PORT% --user=%DB_USER% --single-transaction %DB_NAME% > "%BACKUP_DIR%\%SAFETY_BACKUP%"
) else (
    mysqldump --host=%DB_HOST% --port=%DB_PORT% --user=%DB_USER% --password=%DB_PASSWORD% --single-transaction %DB_NAME% > "%BACKUP_DIR%\%SAFETY_BACKUP%"
)

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Falha ao criar backup de seguranca!
    echo [ERROR] Abortando restauracao por seguranca
    exit /b 1
)

echo [INFO] Backup de seguranca criado: %SAFETY_BACKUP%

REM Realiza a restauração
echo.
echo [INFO] Iniciando restauracao do banco de dados...

REM Verifica se é arquivo compactado
echo %BACKUP_FILE% | findstr /i ".gz" >nul
if %ERRORLEVEL% EQU 0 (
    REM Arquivo compactado - requer descompactação
    where 7z >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] 7-Zip nao encontrado. Necessario para descompactar arquivo .gz
        exit /b 1
    )
    
    set TEMP_FILE=%BACKUP_DIR%\temp_restore_%DB_NAME%.sql
    7z e "%BACKUP_DIR%\%BACKUP_FILE%" -o"%BACKUP_DIR%" -so > "!TEMP_FILE!"
    
    if "%DB_PASSWORD%"=="" (
        mysql --host=%DB_HOST% --port=%DB_PORT% --user=%DB_USER% %DB_NAME% < "!TEMP_FILE!"
    ) else (
        mysql --host=%DB_HOST% --port=%DB_PORT% --user=%DB_USER% --password=%DB_PASSWORD% %DB_NAME% < "!TEMP_FILE!"
    )
    
    del "!TEMP_FILE!"
) else (
    REM Arquivo não compactado
    if "%DB_PASSWORD%"=="" (
        mysql --host=%DB_HOST% --port=%DB_PORT% --user=%DB_USER% %DB_NAME% < "%BACKUP_DIR%\%BACKUP_FILE%"
    ) else (
        mysql --host=%DB_HOST% --port=%DB_PORT% --user=%DB_USER% --password=%DB_PASSWORD% %DB_NAME% < "%BACKUP_DIR%\%BACKUP_FILE%"
    )
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [INFO] Restauracao concluida com sucesso!
    echo ========================================
    exit /b 0
) else (
    echo.
    echo [ERROR] Falha ao restaurar backup!
    echo [INFO] Voce pode restaurar o backup de seguranca: %SAFETY_BACKUP%
    echo ========================================
    exit /b 1
)
