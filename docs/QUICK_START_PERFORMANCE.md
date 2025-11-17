# 🚀 Guia Rápido - Ativando Otimizações de Performance

## Passo a Passo

### 1. Instalar Novas Dependências

```bash
cd Pragas-07ea414485a6d55d3d8b01ae01bc78f9d8dd3ec7

# Instalar dependências de produção
npm install node-cache sharp --save

# Instalar dependências de desenvolvimento (testes)
npm install autocannon chalk cli-table3 --save-dev
```

### 2. Otimizar Banco de Dados

```bash
# Conectar ao MySQL
mysql -u root -p

# Executar script de otimização
mysql> source database/optimization.sql;

# Ou em uma linha:
mysql -u root -p < database/optimization.sql
```

### 3. Verificar Instalação

```bash
# Verificar pacotes instalados
npm list node-cache
npm list sharp
npm list autocannon

# Deve aparecer sem erros
```

### 4. Iniciar Servidor

```bash
# Inicia com cache warmup automático
npm start
```

Você deve ver no console:
```
Servidor rodando na porta 3210
🔥 Aquecendo cache...
✓ Cache aquecido com sucesso
  - 6 categorias
  - 4 métodos
  - 10 pragas populares
```

### 5. Testar Performance (Opcional)

```bash
# Em outro terminal, execute:
npm run test:load

# Aguarde o teste completar (~4-5 minutos)
# Resultados serão exibidos e salvos em tests/results/
```

## Verificação Rápida

### Teste 1: Cache está funcionando?

```bash
# Abra http://localhost:3210/nossascategorias
# Olhe o console do servidor

# Primeira visita:
✗ Cache MISS: categorias:all

# Segunda visita (recarregue a página):
✓ Cache HIT: categorias:all
```

### Teste 2: Lazy Loading está ativo?

1. Abra DevTools (F12)
2. Vá para Network → Images
3. Acesse http://localhost:3210/nossosprodutos
4. Role a página devagar
5. Veja imagens carregando conforme você rola

### Teste 3: Índices foram criados?

```sql
-- No MySQL
USE ecommerce;

SHOW INDEX FROM Praga;
SHOW INDEX FROM Categoria;
SHOW INDEX FROM favoritos;

-- Deve mostrar vários índices (idx_praga_name, etc)
```

## Troubleshooting

### Erro: "Cannot find module 'sharp'"

```bash
# Reinstale sharp
npm install sharp --save --force

# Se persistir (Windows):
npm install --global --production windows-build-tools
npm install sharp
```

### Erro: "Cannot find module 'node-cache'"

```bash
npm install node-cache --save
```

### Erro ao executar optimization.sql

```bash
# Conecte ao MySQL primeiro
mysql -u root -p ecommerce

# Depois execute:
source database/optimization.sql;
```

## Próximos Passos

1. ✅ **Monitorar**: Acompanhe métricas de performance
2. ✅ **Ajustar**: Modifique TTL do cache conforme necessidade
3. ✅ **Escalar**: Configure CDN para imagens (Cloudflare, etc)
4. ✅ **Otimizar**: Adicione mais índices se necessário

## Comandos Úteis

```bash
# Ver estatísticas do cache (adicione rota no app.js)
curl http://localhost:3210/admin/cache-stats

# Executar teste de carga customizado
DURATION=60 CONNECTIONS=50 npm run test:load

# Verificar queries lentas (MySQL)
cat /var/log/mysql/slow-query.log
```

## Suporte

- Documentação completa: `docs/PERFORMANCE_OPTIMIZATION.md`
- Problemas com Sharp: https://sharp.pixelplumbing.com/install
- Node-Cache: https://github.com/node-cache/node-cache

---

**Tempo estimado de configuração:** 10-15 minutos  
**Melhoria esperada:** 5-10x mais rápido 🚀
