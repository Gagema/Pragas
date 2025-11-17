# Guia de Backup e Recuperação

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Backup Automático](#backup-automático)
3. [Backup Manual](#backup-manual)
4. [Restauração](#restauração)
5. [Melhores Práticas](#melhores-práticas)
6. [Testes de Recuperação](#testes-de-recuperação)

---

## Visão Geral

O sistema inclui scripts automatizados para backup e restauração do banco de dados MySQL, garantindo a integridade e disponibilidade dos dados.

### Arquivos Incluídos
- `scripts/backup.sh` - Script de backup para Linux/Mac
- `scripts/backup.bat` - Script de backup para Windows
- `scripts/restore.sh` - Script de restauração para Linux/Mac
- `scripts/restore.bat` - Script de restauração para Windows
- `scripts/backup.env.example` - Exemplo de configuração

### O que é Feito Backup
- ✅ Todas as tabelas do banco de dados
- ✅ Estrutura (schema) das tabelas
- ✅ Dados (registros)
- ✅ Procedures, triggers e eventos
- ✅ Views criadas

### O que NÃO é Feito Backup
- ❌ Arquivos de imagens (`public/images/`)
- ❌ Uploads de usuários (`public/uploads/`)
- ❌ Logs da aplicação
- ❌ Variáveis de ambiente (`.env`)

> **Nota:** Faça backup separado dos diretórios de imagens e uploads!

---

## Backup Automático

### Linux/Mac

#### 1. Configurar Variáveis de Ambiente
```bash
cd scripts
cp backup.env.example .env
nano .env
```

Configurar:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ecommerce
DB_USER=pestcontrol_user
DB_PASSWORD=sua_senha
BACKUP_DIR=./backups/database
BACKUP_RETENTION_DAYS=30
```

#### 2. Tornar Script Executável
```bash
chmod +x backup.sh
chmod +x restore.sh
```

#### 3. Configurar Cron para Backup Automático
```bash
crontab -e
```

Adicionar uma das seguintes linhas:

**Backup Diário às 2:00 AM:**
```cron
0 2 * * * cd /var/www/pestcontrol && ./scripts/backup.sh >> ./logs/backup.log 2>&1
```

**Backup a cada 6 horas:**
```cron
0 */6 * * * cd /var/www/pestcontrol && ./scripts/backup.sh >> ./logs/backup.log 2>&1
```

**Backup Semanal (Domingo às 3:00 AM):**
```cron
0 3 * * 0 cd /var/www/pestcontrol && ./scripts/backup.sh >> ./logs/backup.log 2>&1
```

#### 4. Verificar Agendamento
```bash
crontab -l
```

### Windows

#### 1. Configurar Variáveis de Ambiente
Editar `scripts/.env` ou definir variáveis de ambiente do sistema:
```cmd
set DB_HOST=localhost
set DB_PORT=3306
set DB_NAME=ecommerce
set DB_USER=root
set DB_PASSWORD=sua_senha
```

#### 2. Agendar Tarefa
Abrir PowerShell como Administrador:
```powershell
# Backup diário às 2:00 AM
schtasks /create /tn "Backup PestControl" /tr "C:\caminho\para\projeto\scripts\backup.bat" /sc daily /st 02:00

# Backup a cada 6 horas
schtasks /create /tn "Backup PestControl" /tr "C:\caminho\para\projeto\scripts\backup.bat" /sc hourly /mo 6
```

#### 3. Verificar Tarefa Agendada
```powershell
schtasks /query /tn "Backup PestControl"
```

---

## Backup Manual

### Linux/Mac
```bash
# Executar backup
./scripts/backup.sh

# Com variáveis personalizadas
DB_NAME=ecommerce DB_USER=root DB_PASSWORD=senha ./scripts/backup.sh
```

### Windows
```cmd
# Executar backup
scripts\backup.bat

# Com variáveis personalizadas
set DB_NAME=ecommerce
set DB_USER=root
set DB_PASSWORD=senha
scripts\backup.bat
```

### Saída Esperada
```
========================================
Script de Backup Iniciado
========================================
[INFO] Criando diretório de backup: ./backups/database
[INFO] Iniciando backup do banco de dados: ecommerce
[INFO] Arquivo de destino: ./backups/database/backup_ecommerce_20250117_140530.sql.gz
[INFO] Backup concluído com sucesso! Tamanho: 2.3M
[INFO] Removendo backups com mais de 30 dias...
[INFO] Limpeza de backups antigos concluída
[INFO] Backups existentes:
backup_ecommerce_20250117_140530.sql.gz
========================================
Backup Concluído com Sucesso
========================================
```

---

## Restauração

### ⚠️ IMPORTANTE
- A restauração **SOBRESCREVE** todos os dados atuais do banco
- Um backup de segurança é criado automaticamente antes da restauração
- Confirme que está restaurando o backup correto

### Linux/Mac

#### Restauração Interativa
```bash
./scripts/restore.sh
```

O script irá:
1. Listar backups disponíveis
2. Solicitar seleção do backup
3. Pedir confirmação (digite "SIM")
4. Criar backup de segurança
5. Restaurar o backup selecionado

#### Restauração Direta
```bash
# Especificar arquivo de backup
./scripts/restore.sh ./backups/database/backup_ecommerce_20250117_140530.sql.gz
```

### Windows

#### Restauração Interativa
```cmd
scripts\restore.bat
```

#### Especificar Arquivo
```cmd
set BACKUP_FILE=backup_ecommerce_20250117_140530.sql.gz
scripts\restore.bat
```

### Saída Esperada
```
========================================
Script de Restauração Iniciado
========================================
[INFO] Backups disponíveis:

  [1] backup_ecommerce_20250117_140530.sql.gz - 2.3M
  [2] backup_ecommerce_20250116_020000.sql.gz - 2.1M
  [3] backup_ecommerce_20250115_020000.sql.gz - 2.0M

Digite o número do backup ou o caminho completo: 1

[WARN] ATENÇÃO: Esta operação irá SOBRESCREVER o banco de dados atual!
[WARN] Banco de dados: ecommerce
[WARN] Backup: ./backups/database/backup_ecommerce_20250117_140530.sql.gz

Tem certeza que deseja continuar? (Digite 'SIM' para confirmar): SIM

[INFO] Criando backup de segurança antes da restauração...
[INFO] Backup de segurança criado: safety_backup_ecommerce_20250117_141200.sql.gz
[INFO] Iniciando restauração do banco de dados...
[INFO] Restauração concluída com sucesso!
========================================
Restauração Concluída com Sucesso
========================================
```

---

## Melhores Práticas

### Frequência de Backup
- **Produção:** Diário no mínimo, idealmente a cada 6 horas
- **Desenvolvimento:** Semanal ou antes de mudanças grandes
- **Antes de atualizações:** Sempre fazer backup manual

### Retenção de Backups
- **Padrão:** 30 dias
- **Recomendado para produção:** 60-90 dias
- **Backups críticos:** Manter indefinidamente em storage separado

### Armazenamento
1. **Local:** `./backups/database/` (padrão)
2. **Backup remoto:** Copiar para outro servidor
3. **Cloud:** Upload para S3, Google Cloud Storage, etc.

### Exemplo: Backup Remoto Automático (Linux)
```bash
#!/bin/bash
# Adicionar ao final de backup.sh

# Copiar para servidor remoto via SCP
scp ./backups/database/backup_*.sql.gz usuario@servidor-backup:/backups/

# Ou para S3 (requer AWS CLI)
aws s3 cp ./backups/database/backup_*.sql.gz s3://meu-bucket/backups/
```

### Exemplo: Script de Limpeza Avançado
```bash
# Manter backups diários dos últimos 7 dias
# Manter backups semanais do último mês
# Manter backups mensais de 6 meses

# Backups diários (últimos 7 dias)
find ./backups/database -name "backup_*.sql.gz" -mtime +7 -mtime -30 -exec rm -f {} \;

# Backups mensais (últimos 6 meses)
find ./backups/database -name "backup_*.sql.gz" -mtime +180 -exec rm -f {} \;
```

---

## Testes de Recuperação

### Por que Testar?
- Garantir que backups estão funcionais
- Validar procedimentos de recuperação
- Treinar equipe
- Identificar problemas antes de emergências

### Plano de Teste Mensal

#### 1. Preparar Ambiente de Teste
```bash
# Criar banco de dados de teste
mysql -u root -p
CREATE DATABASE ecommerce_test;
EXIT;
```

#### 2. Restaurar Backup no Ambiente de Teste
```bash
# Alterar variáveis para ambiente de teste
DB_NAME=ecommerce_test ./scripts/restore.sh ./backups/database/backup_mais_recente.sql.gz
```

#### 3. Validar Dados
```sql
-- Conectar ao banco de teste
mysql -u root -p ecommerce_test

-- Verificar tabelas
SHOW TABLES;

-- Contar registros principais
SELECT COUNT(*) FROM Praga;
SELECT COUNT(*) FROM Categoria;
SELECT COUNT(*) FROM usuarios;

-- Verificar integridade
SELECT * FROM Praga LIMIT 10;
```

#### 4. Testar Aplicação
```bash
# Iniciar aplicação apontando para banco de teste
DB_NAME=ecommerce_test npm start
```

#### 5. Documentar Resultados
```markdown
## Teste de Recuperação - [DATA]

**Backup Testado:** backup_ecommerce_20250117.sql.gz
**Tamanho:** 2.3MB
**Tempo de Restauração:** 45 segundos

### Resultados:
- ✅ Restauração bem-sucedida
- ✅ Todas as tabelas presentes
- ✅ Dados íntegros
- ✅ Aplicação funcionando

**Próximo teste:** 17/02/2025
```

### Checklist de Teste de Recuperação

- [ ] Backup pode ser descompactado
- [ ] Restauração completa sem erros
- [ ] Todas as tabelas estão presentes
- [ ] Contagem de registros está correta
- [ ] Integridade referencial mantida
- [ ] Aplicação conecta ao banco restaurado
- [ ] Funcionalidades principais funcionam
- [ ] Tempo de restauração aceitável
- [ ] Processo documentado

---

## Recuperação de Desastres

### Cenário 1: Banco de Dados Corrompido
```bash
# 1. Parar aplicação
pm2 stop pestcontrol-pro

# 2. Verificar último backup
ls -lh ./backups/database/

# 3. Restaurar backup mais recente
./scripts/restore.sh

# 4. Verificar integridade
mysql -u root -p ecommerce
CHECK TABLE Praga, Categoria, usuarios;

# 5. Reiniciar aplicação
pm2 start pestcontrol-pro
```

### Cenário 2: Perda Total do Servidor
```bash
# 1. Preparar novo servidor (seguir DEPLOYMENT_GUIDE.md)

# 2. Baixar backups do storage remoto
scp usuario@backup-server:/backups/backup_*.sql.gz ./backups/database/

# 3. Restaurar backup
./scripts/restore.sh

# 4. Restaurar arquivos de upload
scp -r usuario@backup-server:/uploads/* ./public/uploads/

# 5. Iniciar aplicação
npm run pm2:start
```

### Cenário 3: Erro em Atualização
```bash
# 1. Parar aplicação
pm2 stop pestcontrol-pro

# 2. Reverter código
git reset --hard [commit-anterior]

# 3. Restaurar backup de segurança
./scripts/restore.sh ./backups/database/safety_backup_*.sql.gz

# 4. Reinstalar dependências
npm install

# 5. Reiniciar aplicação
pm2 start pestcontrol-pro
```

---

## Comandos Rápidos

```bash
# Backup manual rápido
./scripts/backup.sh

# Listar backups
ls -lh ./backups/database/

# Ver tamanho total dos backups
du -sh ./backups/database/

# Encontrar backup mais recente
ls -t ./backups/database/ | head -1

# Remover backups com mais de 90 dias
find ./backups/database/ -name "backup_*.sql.gz" -mtime +90 -delete

# Testar conexão com banco
mysql -u pestcontrol_user -p -h localhost ecommerce -e "SELECT VERSION();"

# Backup direto (sem script)
mysqldump -u root -p ecommerce | gzip > backup_manual_$(date +%Y%m%d_%H%M%S).sql.gz
```

---

## Suporte e Problemas

### Script de Backup Falha
- Verificar permissões do diretório
- Verificar credenciais do banco
- Verificar espaço em disco
- Verificar logs: `cat logs/backup.log`

### Restauração Incompleta
- Verificar integridade do arquivo de backup
- Verificar espaço no banco de dados
- Restaurar tabela por tabela manualmente se necessário

### Backup Muito Grande
- Considerar backup incremental
- Limpar dados antigos antes do backup
- Compactar com nível maior (gzip -9)
- Usar backup seletivo de tabelas importantes

---

**Última atualização:** 2025-01-17
**Versão:** 1.0.0
