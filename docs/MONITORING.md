# Monitoramento - PestControl Pro

## 📊 Dashboard e Ferramentas

### 🔍 Sentry (Rastreamento de Erros)
- **URL:** https://sentry.io/pestcontrol
- **Configuração:** Middleware em `middleware/errorTracking.js`
- **Uso:** Captura automática de erros JavaScript e Node.js

#### Configurar Sentry
1. Criar conta em https://sentry.io
2. Criar novo projeto Node.js
3. Copiar DSN fornecido
4. Adicionar ao `.env.production`:
   ```env
   SENTRY_DSN=https://chave@o123456.ingest.sentry.io/7890123
   ```

#### Recursos do Sentry
- ✅ Stack traces completos
- ✅ Contexto de erro (URL, usuário, navegador)
- ✅ Agrupamento inteligente de erros
- ✅ Alertas via email/Slack
- ✅ Performance monitoring (transações)
- ✅ Breadcrumbs (passos do usuário)

---

### 📈 Google Analytics
- **Tracking ID:** Configurado via `.env`
- **Integração:** Middleware em `middleware/analytics.js`
- **Scripts:** `public/js/analytics-events.js`

#### Configurar Google Analytics
1. Criar propriedade em https://analytics.google.com
2. Obter Tracking ID (formato: G-XXXXXXXXXX)
3. Adicionar ao `.env.production`:
   ```env
   GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   ```

#### Eventos Rastreados
- **Produtos:**
  - Visualização de produto
  - Clique em produto
  - Adicionar ao carrinho
  - Adicionar aos favoritos

- **Categorias:**
  - Clique em categoria
  - Navegação por categoria

- **Busca:**
  - Termos pesquisados
  - Resultados encontrados

- **Identificação:**
  - Upload de imagem
  - Resultados visualizados

- **Engagement:**
  - Tempo na página (30s, 60s, 120s)
  - Profundidade de scroll (25%, 50%, 75%, 100%)

#### Relatórios Úteis
- **Realtime:** Usuários ativos agora
- **Audience:** Demographics, dispositivos
- **Acquisition:** Fontes de tráfego
- **Behavior:** Páginas mais visitadas, fluxo de navegação
- **Events:** Eventos customizados rastreados

---

### 🖥️ PM2 Monitoring
```bash
# Status dos processos
pm2 status

# Dashboard em tempo real
pm2 monit

# Logs em tempo real
pm2 logs pestcontrol-pro

# Métricas detalhadas
pm2 show pestcontrol-pro
```

#### Métricas do PM2
- CPU usage
- Memory usage
- Restarts
- Uptime
- Requests per minute

---

### 📊 Nginx Monitoring

#### Logs de Acesso
```bash
# Últimas 100 requisições
tail -100 /var/log/nginx/pestcontrol_access.log

# Requisições em tempo real
tail -f /var/log/nginx/pestcontrol_access.log

# Contar requisições por status
awk '{print $9}' /var/log/nginx/pestcontrol_access.log | sort | uniq -c

# Top 10 páginas mais acessadas
awk '{print $7}' /var/log/nginx/pestcontrol_access.log | sort | uniq -c | sort -rn | head -10

# Top 10 IPs
awk '{print $1}' /var/log/nginx/pestcontrol_access.log | sort | uniq -c | sort -rn | head -10
```

#### Logs de Erro
```bash
# Últimos erros
tail -100 /var/log/nginx/pestcontrol_error.log

# Erros em tempo real
tail -f /var/log/nginx/pestcontrol_error.log

# Contar tipos de erro
grep -o 'error.*' /var/log/nginx/pestcontrol_error.log | sort | uniq -c
```

---

### 🗄️ MySQL Monitoring

#### Performance
```sql
-- Queries mais lentas
SELECT * FROM mysql.slow_query_log 
ORDER BY query_time DESC 
LIMIT 10;

-- Processos ativos
SHOW PROCESSLIST;

-- Status geral
SHOW STATUS;

-- Variáveis de configuração
SHOW VARIABLES LIKE '%cache%';

-- Uso de índices
SHOW INDEX FROM Praga;
```

#### Tamanho e Uso
```sql
-- Tamanho das tabelas
SELECT 
  table_name AS 'Tabela',
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Tamanho (MB)'
FROM information_schema.TABLES 
WHERE table_schema = 'ecommerce' 
ORDER BY (data_length + index_length) DESC;

-- Estatísticas de uso
SELECT * FROM information_schema.TABLE_STATISTICS;

-- Cache hits
SHOW STATUS LIKE 'Qcache%';
```

---

## 🚨 Alertas e Notificações

### Configurar Alertas no Sentry
1. Projeto → Settings → Alerts
2. Criar nova regra:
   - **Condição:** Erros > 10 em 1 minuto
   - **Ação:** Email + Slack notification
   - **Filtros:** Apenas production

### Configurar Alertas no Google Analytics
1. Analytics → Admin → View → Custom Alerts
2. Exemplos:
   - Tráfego cai > 50% comparado com semana passada
   - Taxa de erro > 5%
   - Tempo de carregamento > 10s

### Monitoramento de Uptime
Usar serviço como UptimeRobot:
1. Adicionar monitor HTTP(S)
2. URL: https://pestcontrol.com/health
3. Intervalo: 5 minutos
4. Alertas via email/SMS quando offline

---

## 📋 Checklist de Monitoramento Diário

### Manhã (9h)
- [ ] Verificar Sentry - novos erros?
- [ ] Verificar PM2 status - todos processos rodando?
- [ ] Verificar uso de recursos (CPU/RAM/Disco)
- [ ] Revisar logs de backup da noite

### Tarde (14h)
- [ ] Analisar Google Analytics - tráfego normal?
- [ ] Verificar queries lentas no MySQL
- [ ] Revisar logs de erro do Nginx

### Noite (18h)
- [ ] Verificar métricas do dia
- [ ] Documentar incidentes (se houver)
- [ ] Planejar ações para amanhã

---

## 🎯 KPIs Principais

### Performance
- **Tempo de resposta médio:** < 500ms
- **Disponibilidade:** > 99.5%
- **Taxa de erro:** < 1%
- **Tempo de TTFB:** < 200ms

### Negócio
- **DAU (Daily Active Users):** Meta definir após lançamento
- **Identificações/dia:** Acompanhar tendência
- **Taxa de conversão:** Visualizações → Carrinho
- **Retenção 7 dias:** > 40%

### Técnicos
- **Erros JavaScript/dia:** < 50
- **Erros Node.js/dia:** < 20
- **Queries lentas (>2s):** 0
- **CPU médio:** < 60%
- **RAM médio:** < 70%

---

**Configuração concluída!** ✅

Após configurar Sentry e Google Analytics, todos os eventos serão rastreados automaticamente.
