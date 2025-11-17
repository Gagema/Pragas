#!/bin/bash

###############################################################################
# Script de Restauração do Banco de Dados MySQL
# Restaura um backup do banco de dados
###############################################################################

# Configurações
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-ecommerce}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD}"

BACKUP_DIR="${BACKUP_DIR:-./backups/database}"

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

###############################################################################
# Funções
###############################################################################

log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Lista backups disponíveis
list_backups() {
    log_info "Backups disponíveis:"
    echo ""
    
    local count=1
    for backup in "$BACKUP_DIR"/backup_${DB_NAME}_*.sql.gz; do
        if [ -f "$backup" ]; then
            local size=$(du -h "$backup" | cut -f1)
            local date=$(basename "$backup" | sed "s/backup_${DB_NAME}_\(.*\)\.sql\.gz/\1/")
            echo "  [$count] $(basename $backup) - $size - $date"
            ((count++))
        fi
    done
    
    if [ $count -eq 1 ]; then
        log_warn "Nenhum backup encontrado em $BACKUP_DIR"
        return 1
    fi
    
    echo ""
    return 0
}

# Seleciona backup
select_backup() {
    if [ -z "$1" ]; then
        list_backups || return 1
        
        echo -n "Digite o número do backup ou o caminho completo: "
        read selection
        
        # Verifica se é um número
        if [[ "$selection" =~ ^[0-9]+$ ]]; then
            local count=1
            for backup in "$BACKUP_DIR"/backup_${DB_NAME}_*.sql.gz; do
                if [ -f "$backup" ] && [ $count -eq $selection ]; then
                    SELECTED_BACKUP="$backup"
                    return 0
                fi
                ((count++))
            done
            log_error "Seleção inválida"
            return 1
        else
            SELECTED_BACKUP="$selection"
        fi
    else
        SELECTED_BACKUP="$1"
    fi
    
    # Verifica se o arquivo existe
    if [ ! -f "$SELECTED_BACKUP" ]; then
        log_error "Arquivo não encontrado: $SELECTED_BACKUP"
        return 1
    fi
    
    return 0
}

# Confirma restauração
confirm_restore() {
    log_warn "ATENÇÃO: Esta operação irá SOBRESCREVER o banco de dados atual!"
    log_warn "Banco de dados: $DB_NAME"
    log_warn "Backup: $SELECTED_BACKUP"
    echo ""
    echo -n "Tem certeza que deseja continuar? (Digite 'SIM' para confirmar): "
    read confirmation
    
    if [ "$confirmation" != "SIM" ]; then
        log_info "Restauração cancelada pelo usuário"
        return 1
    fi
    
    return 0
}

# Cria backup de segurança antes de restaurar
create_safety_backup() {
    log_info "Criando backup de segurança antes da restauração..."
    
    local safety_backup="${BACKUP_DIR}/safety_backup_${DB_NAME}_$(date +%Y%m%d_%H%M%S).sql.gz"
    
    if [ -n "$DB_PASSWORD" ]; then
        mysqldump \
            --host="$DB_HOST" \
            --port="$DB_PORT" \
            --user="$DB_USER" \
            --password="$DB_PASSWORD" \
            --single-transaction \
            "$DB_NAME" | gzip > "$safety_backup"
    else
        mysqldump \
            --host="$DB_HOST" \
            --port="$DB_PORT" \
            --user="$DB_USER" \
            --single-transaction \
            "$DB_NAME" | gzip > "$safety_backup"
    fi
    
    if [ $? -eq 0 ]; then
        log_info "Backup de segurança criado: $safety_backup"
        return 0
    else
        log_error "Falha ao criar backup de segurança!"
        return 1
    fi
}

# Realiza a restauração
perform_restore() {
    log_info "Iniciando restauração do banco de dados..."
    log_info "Backup: $SELECTED_BACKUP"
    
    # Verifica se o arquivo está compactado
    if [[ "$SELECTED_BACKUP" == *.gz ]]; then
        if [ -n "$DB_PASSWORD" ]; then
            gunzip < "$SELECTED_BACKUP" | mysql \
                --host="$DB_HOST" \
                --port="$DB_PORT" \
                --user="$DB_USER" \
                --password="$DB_PASSWORD" \
                "$DB_NAME"
        else
            gunzip < "$SELECTED_BACKUP" | mysql \
                --host="$DB_HOST" \
                --port="$DB_PORT" \
                --user="$DB_USER" \
                "$DB_NAME"
        fi
    else
        if [ -n "$DB_PASSWORD" ]; then
            mysql \
                --host="$DB_HOST" \
                --port="$DB_PORT" \
                --user="$DB_USER" \
                --password="$DB_PASSWORD" \
                "$DB_NAME" < "$SELECTED_BACKUP"
        else
            mysql \
                --host="$DB_HOST" \
                --port="$DB_PORT" \
                --user="$DB_USER" \
                "$DB_NAME" < "$SELECTED_BACKUP"
        fi
    fi
    
    if [ $? -eq 0 ]; then
        log_info "Restauração concluída com sucesso!"
        return 0
    else
        log_error "Falha ao restaurar backup!"
        return 1
    fi
}

###############################################################################
# Execução Principal
###############################################################################

main() {
    log_info "=== Script de Restauração Iniciado ==="
    
    # Seleciona o backup
    if ! select_backup "$1"; then
        exit 1
    fi
    
    # Confirma restauração
    if ! confirm_restore; then
        exit 1
    fi
    
    # Cria backup de segurança
    if ! create_safety_backup; then
        log_error "Abortando restauração por segurança"
        exit 1
    fi
    
    # Realiza a restauração
    if perform_restore; then
        log_info "=== Restauração Concluída com Sucesso ==="
        exit 0
    else
        log_error "=== Restauração Falhou ==="
        exit 1
    fi
}

# Executa o script
main "$@"
