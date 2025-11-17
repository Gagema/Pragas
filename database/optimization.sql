-- database/optimization.sql
-- Script de otimização do banco de dados
-- Adiciona índices e melhorias de performance

USE ecommerce;

-- ============================================
-- ÍNDICES PARA TABELA Praga
-- ============================================

-- Índice para busca por nome (usado em search)
CREATE INDEX IF NOT EXISTS idx_praga_name ON Praga(name);

-- Índice para busca por nome científico
CREATE INDEX IF NOT EXISTS idx_praga_name2 ON Praga(name2);

-- Índice composto para filtros por categoria (muito usado)
CREATE INDEX IF NOT EXISTS idx_praga_categoria ON Praga(Categoria_id, createdAt DESC);

-- Índice para filtros por método
CREATE INDEX IF NOT EXISTS idx_praga_metodo ON Praga(Metodo_id);

-- Índice para ordenação por data
CREATE INDEX IF NOT EXISTS idx_praga_created ON Praga(createdAt DESC);

-- Índice de texto completo para busca (MySQL 5.7+)
ALTER TABLE Praga ADD FULLTEXT INDEX idx_praga_search (name, name2, description);

-- ============================================
-- ÍNDICES PARA TABELA Categoria
-- ============================================

-- Índice para ordenação
CREATE INDEX IF NOT EXISTS idx_categoria_created ON Categoria(createdAt DESC);

-- Índice para busca por nome
CREATE INDEX IF NOT EXISTS idx_categoria_name ON Categoria(name);

-- ============================================
-- ÍNDICES PARA TABELA Metodo
-- ============================================

-- Índice para ordenação
CREATE INDEX IF NOT EXISTS idx_metodo_created ON Metodo(createdAt DESC);

-- Índice para busca
CREATE INDEX IF NOT EXISTS idx_metodo_name ON Metodo(name);

-- ============================================
-- ÍNDICES PARA TABELA usuarios
-- ============================================

-- Índice único para login (já existe como PRIMARY KEY no id)
CREATE INDEX IF NOT EXISTS idx_usuarios_usuario ON usuarios(usuario);

-- Índice para filtro por função
CREATE INDEX IF NOT EXISTS idx_usuarios_funcao ON usuarios(funcao);

-- ============================================
-- ÍNDICES PARA TABELA favoritos
-- ============================================

-- Índice composto para busca de favoritos por usuário
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON favoritos(usuario_id, praga_id);

-- Índice para contagem de favoritos por praga
CREATE INDEX IF NOT EXISTS idx_favoritos_praga ON favoritos(praga_id);

-- ============================================
-- ÍNDICES PARA TABELA carrinho
-- ============================================

-- Índice para busca por usuário
CREATE INDEX IF NOT EXISTS idx_carrinho_usuario ON carrinho(id_usuario);

-- Índice composto
CREATE INDEX IF NOT EXISTS idx_carrinho_usuario_produto ON carrinho(id_usuario, id_products);

-- ============================================
-- OTIMIZAÇÕES ADICIONAIS
-- ============================================

-- Analisa tabelas para atualizar estatísticas
ANALYZE TABLE Praga;
ANALYZE TABLE Categoria;
ANALYZE TABLE Metodo;
ANALYZE TABLE usuarios;
ANALYZE TABLE favoritos;
ANALYZE TABLE carrinho;

-- Otimiza tabelas (reorganiza dados e índices)
OPTIMIZE TABLE Praga;
OPTIMIZE TABLE Categoria;
OPTIMIZE TABLE Metodo;
OPTIMIZE TABLE usuarios;
OPTIMIZE TABLE favoritos;
OPTIMIZE TABLE carrinho;

-- ============================================
-- VIEWS PARA QUERIES COMPLEXAS
-- ============================================

-- View para pragas com informações completas (evita JOINs repetidos)
CREATE OR REPLACE VIEW v_pragas_completas AS
SELECT 
    p.*,
    c.name as categoria_nome,
    c.description as categoria_descricao,
    c.imageUrl as categoria_imagem,
    m.name as metodo_nome,
    m.description as metodo_descricao,
    m.principios_ativos,
    m.manejo_integrado,
    (SELECT COUNT(*) FROM favoritos f WHERE f.praga_id = p.id) as total_favoritos
FROM Praga p
LEFT JOIN Categoria c ON p.Categoria_id = c.id
LEFT JOIN Metodo m ON p.Metodo_id = m.id;

-- View para estatísticas de categorias
CREATE OR REPLACE VIEW v_categorias_stats AS
SELECT 
    c.*,
    COUNT(p.id) as total_pragas
FROM Categoria c
LEFT JOIN Praga p ON c.id = p.Categoria_id
GROUP BY c.id;

-- View para pragas mais favoritadas
CREATE OR REPLACE VIEW v_pragas_populares AS
SELECT 
    p.*,
    COUNT(f.id) as total_favoritos
FROM Praga p
LEFT JOIN favoritos f ON p.id = f.praga_id
GROUP BY p.id
ORDER BY total_favoritos DESC;

-- ============================================
-- CONFIGURAÇÕES DE PERFORMANCE
-- ============================================

-- Aumenta buffer pool (ajuste conforme memória disponível)
-- SET GLOBAL innodb_buffer_pool_size = 256M;

-- Otimiza query cache (MySQL 5.7)
-- SET GLOBAL query_cache_size = 64M;
-- SET GLOBAL query_cache_type = 1;

-- ============================================
-- MONITORAMENTO
-- ============================================

-- Query para verificar índices criados
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'ecommerce'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- Query para verificar tamanho das tabelas
SELECT 
    TABLE_NAME,
    ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS 'Tamanho (MB)',
    TABLE_ROWS
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'ecommerce'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;

-- Query para identificar queries lentas (executar no servidor)
-- SHOW FULL PROCESSLIST;

-- Habilitar log de queries lentas (ajustar no my.cnf)
-- slow_query_log = 1
-- long_query_time = 2
-- slow_query_log_file = /var/log/mysql/slow-query.log

SELECT 'Otimização do banco de dados concluída!' as Status;
