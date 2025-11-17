# Guia de Deploy - PestControl Pro

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Preparação do Servidor](#preparação-do-servidor)
3. [Deploy da Aplicação](#deploy-da-aplicação)
4. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
5. [Configuração do Nginx](#configuração-do-nginx)
6. [Configuração do SSL](#configuração-do-ssl)
7. [Iniciar a Aplicação](#iniciar-a-aplicação)
8. [Verificação](#verificação)
9. [Troubleshooting](#troubleshooting)

---

## Pré-requisitos

### Servidor
- **OS**: Ubuntu 20.04 LTS ou superior / CentOS 7+
- **RAM**: Mínimo 2GB, recomendado 4GB
- **CPU**: Mínimo 2 cores
- **Disco**: 20GB disponíveis
- **Firewall**: Portas 80 e 443 abertas

### Software Necessário
- Node.js v18+ e npm
- MySQL 5.7+ ou 8.0+
- Nginx
- PM2 (gerenciador de processos)
- Git
- Certbot (para SSL)

---

## Preparação do Servidor

### 1. Atualizar Sistema
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 2. Instalar Node.js
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 3. Instalar MySQL
```bash
# Ubuntu/Debian
sudo apt install -y mysql-server
sudo mysql_secure_installation

# CentOS/RHEL
sudo yum install -y mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld
sudo mysql_secure_installation
```

### 4. Instalar Nginx
```bash
# Ubuntu/Debian
sudo apt install -y nginx
sudo systemctl enable nginx

# CentOS/RHEL
sudo yum install -y nginx
sudo systemctl enable nginx
```

### 5. Instalar PM2 Globalmente
```bash
sudo npm install -g pm2
pm2 startup systemd
```

### 6. Criar Usuário da Aplicação (Recomendado)
```bash
sudo adduser pestcontrol
sudo usermod -aG sudo pestcontrol
su - pestcontrol
```

---

## Deploy da Aplicação

### 1. Clonar Repositório
```bash
cd /var/www
sudo mkdir pestcontrol
sudo chown pestcontrol:pestcontrol pestcontrol
cd pestcontrol

# Clonar do repositório
git clone https://github.com/Gagema/Pragas.git .
git checkout sprint4-teste
```

### 2. Instalar Dependências
```bash
npm install --production
```

### 3. Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.production.example .env.production

# Editar com valores reais
nano .env.production
```

**Configurações essenciais a preencher:**
```env
NODE_ENV=production
PORT=3210

DB_HOST=localhost
DB_USER=pestcontrol_user
DB_PASSWORD=senha_forte_aqui
DB_NAME=ecommerce

SESSION_SECRET=gere_chave_secreta_forte_32_caracteres

SENTRY_DSN=https://sua_chave@sentry.io/projeto
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### 4. Criar Diretórios Necessários
```bash
mkdir -p logs
mkdir -p backups/database
mkdir -p public/uploads
chmod 755 public/uploads
```

---

## Configuração do Banco de Dados

### 1. Criar Banco de Dados e Usuário
```bash
mysql -u root -p
```

```sql
-- Criar banco de dados
CREATE DATABASE ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário
CREATE USER 'pestcontrol_user'@'localhost' IDENTIFIED BY 'senha_forte_aqui';
GRANT ALL PRIVILEGES ON ecommerce.* TO 'pestcontrol_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Importar Schema
```bash
mysql -u pestcontrol_user -p ecommerce < database/schema.sql
```

### 3. Aplicar Otimizações
```bash
mysql -u pestcontrol_user -p ecommerce < database/optimization.sql
```

### 4. Criar Usuário Admin
```bash
node createUser.js
```

---

## Configuração do Nginx

### 1. Copiar Configuração
```bash
sudo cp config/nginx.conf /etc/nginx/sites-available/pestcontrol
```

### 2. Editar Configuração
```bash
sudo nano /etc/nginx/sites-available/pestcontrol
```

**Alterar:**
- `pestcontrol.example.com` para seu domínio real
- Caminhos dos certificados SSL (após gerar com Certbot)

### 3. Ativar Site
```bash
sudo ln -s /etc/nginx/sites-available/pestcontrol /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove site padrão
```

### 4. Testar Configuração
```bash
sudo nginx -t
```

---

## Configuração do SSL

### 1. Instalar Certbot
```bash
# Ubuntu/Debian
sudo apt install -y certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install -y certbot python3-certbot-nginx
```

### 2. Gerar Certificado
```bash
sudo certbot --nginx -d pestcontrol.example.com -d www.pestcontrol.example.com
```

### 3. Renovação Automática
```bash
# Testar renovação
sudo certbot renew --dry-run

# Adicionar ao cron (já configurado automaticamente pelo Certbot)
sudo crontab -e
# Adicionar se não existir:
# 0 3 * * * certbot renew --quiet
```

### 4. Recarregar Nginx
```bash
sudo systemctl reload nginx
```

---

## Iniciar a Aplicação

### 1. Usar PM2 para Gerenciamento
```bash
# Iniciar aplicação em modo produção
npm run pm2:start

# Verificar status
pm2 status

# Ver logs
pm2 logs pestcontrol-pro

# Monitorar recursos
pm2 monit
```

### 2. Salvar Configuração PM2
```bash
pm2 save
```

### 3. Configurar PM2 para Iniciar no Boot
```bash
pm2 startup systemd
# Executar o comando sugerido pelo PM2
```

---

## Verificação

### 1. Verificar Serviços
```bash
# Nginx
sudo systemctl status nginx

# MySQL
sudo systemctl status mysql

# PM2
pm2 status
```

### 2. Testar Endpoints
```bash
# Health check
curl https://pestcontrol.example.com/health

# Página inicial
curl https://pestcontrol.example.com/
```

### 3. Verificar Logs
```bash
# Logs da aplicação
pm2 logs pestcontrol-pro

# Logs do Nginx
sudo tail -f /var/log/nginx/pestcontrol_access.log
sudo tail -f /var/log/nginx/pestcontrol_error.log
```

---

## Configuração de Backup Automático

### 1. Configurar Script de Backup
```bash
cp scripts/backup.env.example scripts/.env
nano scripts/.env
```

### 2. Adicionar ao Crontab
```bash
crontab -e

# Adicionar linha para backup diário às 2:00 AM
0 2 * * * cd /var/www/pestcontrol && ./scripts/backup.sh >> ./logs/backup.log 2>&1
```

### 3. Testar Backup Manualmente
```bash
./scripts/backup.sh
```

---

## Troubleshooting

### Aplicação Não Inicia
```bash
# Verificar logs
pm2 logs pestcontrol-pro --lines 100

# Verificar porta em uso
sudo netstat -tulpn | grep 3210

# Reiniciar aplicação
pm2 restart pestcontrol-pro
```

### Erro de Conexão com Banco de Dados
```bash
# Testar conexão
mysql -u pestcontrol_user -p -h localhost ecommerce

# Verificar permissões
mysql -u root -p
SHOW GRANTS FOR 'pestcontrol_user'@'localhost';
```

### Nginx Retorna 502 Bad Gateway
```bash
# Verificar se aplicação está rodando
pm2 status

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/pestcontrol_error.log

# Testar conectividade local
curl http://localhost:3210
```

### Problemas com SSL
```bash
# Renovar certificado
sudo certbot renew

# Verificar validade
sudo certbot certificates

# Testar configuração SSL
sudo nginx -t
```

### Alto Uso de Memória
```bash
# Verificar uso
pm2 monit

# Ajustar max_memory_restart em ecosystem.config.json
# Reiniciar com novas configurações
pm2 reload ecosystem.config.json
```

---

## Comandos Úteis

### PM2
```bash
pm2 start ecosystem.config.json    # Iniciar
pm2 stop pestcontrol-pro           # Parar
pm2 restart pestcontrol-pro        # Reiniciar
pm2 reload pestcontrol-pro         # Reload sem downtime
pm2 logs pestcontrol-pro           # Ver logs
pm2 monit                          # Monitor em tempo real
pm2 delete pestcontrol-pro         # Remover da lista
```

### Nginx
```bash
sudo nginx -t                      # Testar configuração
sudo systemctl reload nginx        # Recarregar configuração
sudo systemctl restart nginx       # Reiniciar
sudo systemctl status nginx        # Ver status
```

### MySQL
```bash
sudo systemctl status mysql        # Status
mysql -u root -p                   # Conectar
sudo tail -f /var/log/mysql/error.log  # Ver logs
```

---

## Próximos Passos

Após deploy bem-sucedido:
1. ✅ Configurar monitoramento com Sentry
2. ✅ Ativar Google Analytics
3. ✅ Configurar backup automático
4. ✅ Testar procedimento de recuperação
5. ✅ Configurar alertas de erro
6. ✅ Documentar processo de atualização

---

**Última atualização:** 2025-01-17
**Versão:** 1.0.0
