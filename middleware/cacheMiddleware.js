// middleware/cacheMiddleware.js
// Sistema de cache em memória para melhorar performance

const NodeCache = require('node-cache');

// Configuração dos caches
const caches = {
  // Cache de 1 hora para dados estáticos
  static: new NodeCache({ 
    stdTTL: 3600, 
    checkperiod: 600,
    useClones: false 
  }),
  
  // Cache de 5 minutos para dados dinâmicos
  dynamic: new NodeCache({ 
    stdTTL: 300, 
    checkperiod: 60,
    useClones: false 
  }),
  
  // Cache de 15 minutos para listagens
  lists: new NodeCache({ 
    stdTTL: 900, 
    checkperiod: 120,
    useClones: false 
  })
};

/**
 * Middleware de cache genérico
 * @param {string} cacheType - Tipo de cache (static, dynamic, lists)
 * @param {function} keyGenerator - Função para gerar chave única do cache
 */
function cacheMiddleware(cacheType = 'dynamic', keyGenerator) {
  return (req, res, next) => {
    const cache = caches[cacheType];
    
    if (!cache) {
      console.warn(`Cache type "${cacheType}" não existe`);
      return next();
    }

    // Gera chave do cache
    const key = keyGenerator ? keyGenerator(req) : req.originalUrl || req.url;
    
    // Verifica se existe no cache
    const cachedData = cache.get(key);
    
    if (cachedData) {
      console.log(`✓ Cache HIT: ${key}`);
      
      // Se for render, renderiza com dados do cache
      if (cachedData.type === 'render') {
        return res.render(cachedData.view, cachedData.data);
      }
      
      // Se for JSON, retorna JSON
      if (cachedData.type === 'json') {
        return res.json(cachedData.data);
      }
      
      return res.send(cachedData.data);
    }
    
    console.log(`✗ Cache MISS: ${key}`);
    
    // Intercepta res.render para cachear
    const originalRender = res.render.bind(res);
    res.render = function(view, data, callback) {
      cache.set(key, {
        type: 'render',
        view,
        data
      });
      originalRender(view, data, callback);
    };
    
    // Intercepta res.json para cachear
    const originalJson = res.json.bind(res);
    res.json = function(data) {
      cache.set(key, {
        type: 'json',
        data
      });
      originalJson(data);
    };
    
    next();
  };
}

/**
 * Cache específico para categorias
 */
function cacheCategorias() {
  return cacheMiddleware('static', () => 'categorias:all');
}

/**
 * Cache específico para pragas por categoria
 */
function cachePragasPorCategoria() {
  return cacheMiddleware('lists', (req) => `categoria:${req.params.id}:pragas`);
}

/**
 * Cache específico para detalhes de praga
 */
function cachePragaDetalhes() {
  return cacheMiddleware('dynamic', (req) => `praga:${req.params.id}`);
}

/**
 * Cache específico para métodos
 */
function cacheMetodos() {
  return cacheMiddleware('static', () => 'metodos:all');
}

/**
 * Cache específico para busca
 */
function cacheBusca() {
  return cacheMiddleware('dynamic', (req) => `search:${req.query.q || ''}`);
}

/**
 * Limpa cache específico
 */
function clearCache(cacheType, pattern) {
  const cache = caches[cacheType];
  
  if (!cache) {
    return false;
  }
  
  if (pattern) {
    // Limpa chaves que correspondem ao padrão
    const keys = cache.keys();
    const keysToDelete = keys.filter(key => key.includes(pattern));
    cache.del(keysToDelete);
    console.log(`Cache limpo: ${keysToDelete.length} entradas removidas (${pattern})`);
  } else {
    // Limpa todo o cache
    cache.flushAll();
    console.log(`Cache ${cacheType} completamente limpo`);
  }
  
  return true;
}

/**
 * Limpa todos os caches relacionados a uma entidade
 */
function clearEntityCache(entity, id) {
  Object.keys(caches).forEach(cacheType => {
    clearCache(cacheType, `${entity}:${id || ''}`);
  });
}

/**
 * Middleware para limpar cache após modificações
 */
function clearCacheAfter(entity) {
  return (req, res, next) => {
    // Salva referência ao redirect original
    const originalRedirect = res.redirect.bind(res);
    
    // Sobrescreve redirect para limpar cache antes
    res.redirect = function(...args) {
      clearEntityCache(entity, req.params.id);
      originalRedirect(...args);
    };
    
    next();
  };
}

/**
 * Estatísticas do cache
 */
function getCacheStats() {
  const stats = {};
  
  Object.keys(caches).forEach(type => {
    const cache = caches[type];
    stats[type] = {
      keys: cache.keys().length,
      hits: cache.getStats().hits,
      misses: cache.getStats().misses,
      hitRate: cache.getStats().hits / (cache.getStats().hits + cache.getStats().misses) * 100 || 0
    };
  });
  
  return stats;
}

/**
 * Aquecimento do cache (pre-cache dados importantes)
 */
async function warmupCache(pool) {
  try {
    console.log('🔥 Aquecendo cache...');
    
    // Pre-carrega categorias
    const [categorias] = await pool.query('SELECT * FROM Categoria ORDER BY createdAt DESC');
    caches.static.set('categorias:all', {
      type: 'json',
      data: categorias
    });
    
    // Pre-carrega métodos
    const [metodos] = await pool.query('SELECT * FROM Metodo ORDER BY createdAt DESC');
    caches.static.set('metodos:all', {
      type: 'json',
      data: metodos
    });
    
    // Pre-carrega pragas mais acessadas (top 10)
    const [pragasPopulares] = await pool.query(
      'SELECT * FROM Praga ORDER BY createdAt DESC LIMIT 10'
    );
    
    pragasPopulares.forEach(praga => {
      caches.dynamic.set(`praga:${praga.id}`, {
        type: 'json',
        data: praga
      });
    });
    
    console.log('✓ Cache aquecido com sucesso');
    console.log(`  - ${categorias.length} categorias`);
    console.log(`  - ${metodos.length} métodos`);
    console.log(`  - ${pragasPopulares.length} pragas populares`);
    
  } catch (error) {
    console.error('Erro ao aquecer cache:', error);
  }
}

module.exports = {
  cacheMiddleware,
  cacheCategorias,
  cachePragasPorCategoria,
  cachePragaDetalhes,
  cacheMetodos,
  cacheBusca,
  clearCache,
  clearEntityCache,
  clearCacheAfter,
  getCacheStats,
  warmupCache
};
