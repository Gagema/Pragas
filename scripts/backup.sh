#!/bin/bash

###############################################################################
# Script de Backup do Banco de Dados MySQL
# Realiza backup completo do banco de dados com compressão
###############################################################################

# Configurações (substituir com valores reais ou usar variáveis de ambiente)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-ecommerce}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD}"

# Diretório de backup
BACKUP_DIR="${BACKUP_DIR:-./backups/database}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_${DB_NAME}_${TIMESTAMP}.sql"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"

# Número de dias para manter backups (padrão: 30 dias)
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

###############################################################################
# Funções
###############################################################################

# Função de log
log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Cria diretório de backup se não existir
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        log_info "Criando diretório de backup: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
    fi
}

# Realiza o backup
perform_backup() {
    log_info "Iniciando backup do banco de dados: $DB_NAME"
    log_info "Arquivo de destino: $BACKUP_FILE_GZ"
    
    # Verifica se mysqldump está disponível
    if ! command -v mysqldump &> /dev/null; then
        log_error "mysqldump não encontrado. Instale o MySQL client."
        exit 1
    fi
    
    # Realiza o dump com compressão
    if [ -n "$DB_PASSWORD" ]; then
        mysqldump \
            --host="$DB_HOST" \
            --port="$DB_PORT" \
            --user="$DB_USER" \
            --password="$DB_PASSWORD" \
            --single-transaction \
            --routines \
            --triggers \
            --events \
            "$DB_NAME" | gzip > "$BACKUP_FILE_GZ"
    else
        mysqldump \
            --host="$DB_HOST" \
            --port="$DB_PORT" \
            --user="$DB_USER" \
            --single-transaction \
            --routines \
            --triggers \
            --events \
            "$DB_NAME" | gzip > "$BACKUP_FILE_GZ"
    fi
    
    # Verifica se o backup foi criado com sucesso
    if [ $? -eq 0 ] && [ -f "$BACKUP_FILE_GZ" ]; then
        BACKUP_SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)
        log_info "Backup concluído com sucesso! Tamanho: $BACKUP_SIZE"
        return 0
    else
        log_error "Falha ao criar backup!"
        return 1
    fi
}

# Remove backups antigos
cleanup_old_backups() {
    log_info "Removendo backups com mais de $RETENTION_DAYS dias..."
    
    # Encontra e remove arquivos antigos
    find "$BACKUP_DIR" -name "backup_${DB_NAME}_*.sql.gz" -type f -mtime +$RETENTION_DAYS -exec rm -f {} \;
    
    if [ $? -eq 0 ]; then
        log_info "Limpeza de backups antigos concluída"
    else
        log_warn "Erro ao limpar backups antigos"
    fi
}

# Lista backups existentes
list_backups() {
    log_info "Backups existentes:"
    ls -lh "$BACKUP_DIR"/backup_${DB_NAME}_*.sql.gz 2>/dev/null || log_warn "Nenhum backup encontrado"
}

###############################################################################
# Execução Principal
###############################################################################

main() {
    log_info "=== Script de Backup Iniciado ==="
    
    # Cria diretório de backup
    create_backup_dir
    
    # Realiza o backup
    if perform_backup; then
        # Limpa backups antigos
        cleanup_old_backups
        
        # Lista backups disponíveis
        list_backups
        
        log_info "=== Backup Concluído com Sucesso ==="
        exit 0
    else
        log_error "=== Backup Falhou ==="
        exit 1
    fi
}

# Executa o script
main
