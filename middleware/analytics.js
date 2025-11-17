/**
 * Middleware de Analytics
 * Integração com Google Analytics para rastreamento de uso
 */

/**
 * Injeta o código do Google Analytics nas páginas
 * @param {string} trackingId - ID de rastreamento do Google Analytics (ex: G-XXXXXXXXXX)
 */
function getAnalyticsScript(trackingId) {
  if (!trackingId || process.env.NODE_ENV !== 'production') {
    return '';
  }

  return `
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${trackingId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${trackingId}', {
    'anonymize_ip': true,
    'cookie_flags': 'SameSite=None;Secure'
  });
  
  // Eventos personalizados
  function trackEvent(category, action, label, value) {
    gtag('event', action, {
      'event_category': category,
      'event_label': label,
      'value': value
    });
  }
  
  // Expõe função globalmente
  window.trackEvent = trackEvent;
</script>
`;
}

/**
 * Middleware para adicionar Analytics às views
 */
function analyticsMiddleware(req, res, next) {
  const trackingId = process.env.GOOGLE_ANALYTICS_ID;
  
  // Adiciona função helper para templates
  res.locals.analyticsScript = getAnalyticsScript(trackingId);
  res.locals.hasAnalytics = !!trackingId && process.env.NODE_ENV === 'production';
  
  next();
}

/**
 * Registra evento de página no servidor (opcional)
 */
function trackPageView(req) {
  if (process.env.NODE_ENV === 'production') {
    // Aqui pode implementar tracking server-side se necessário
    const pageData = {
      path: req.path,
      method: req.method,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString()
    };
    
    // Log para análise posterior ou envio para analytics
    console.log('Page View:', JSON.stringify(pageData));
  }
}

/**
 * Eventos comuns para rastreamento
 */
const EventCategories = {
  PRODUTO: 'Produto',
  CATEGORIA: 'Categoria',
  PESQUISA: 'Pesquisa',
  IDENTIFICACAO: 'Identificacao',
  USUARIO: 'Usuario',
  CARRINHO: 'Carrinho',
  FAVORITOS: 'Favoritos'
};

const EventActions = {
  VIEW: 'visualizacao',
  CLICK: 'clique',
  SEARCH: 'busca',
  UPLOAD: 'upload',
  ADD: 'adicionar',
  REMOVE: 'remover',
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'registro'
};

module.exports = {
  analyticsMiddleware,
  getAnalyticsScript,
  trackPageView,
  EventCategories,
  EventActions
};
