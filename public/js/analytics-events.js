/**
 * Sistema de rastreamento de eventos do lado do cliente
 * Usa Google Analytics para rastrear interações do usuário
 */

(function() {
  'use strict';

  // Verifica se o Google Analytics está disponível
  function isAnalyticsAvailable() {
    return typeof window.gtag === 'function';
  }

  // Função helper para rastrear eventos
  function trackEvent(category, action, label, value) {
    if (isAnalyticsAvailable()) {
      window.gtag('event', action, {
        'event_category': category,
        'event_label': label,
        'value': value
      });
    } else {
      console.log('Analytics Event:', { category, action, label, value });
    }
  }

  // Rastreia cliques em produtos
  document.addEventListener('click', function(e) {
    const productCard = e.target.closest('.product-card, .praga-card');
    if (productCard) {
      const productName = productCard.querySelector('.product-name, .praga-name')?.textContent || 'Desconhecido';
      trackEvent('Produto', 'clique', productName);
    }

    // Rastreia cliques em categorias
    const categoryCard = e.target.closest('.categoria-card');
    if (categoryCard) {
      const categoryName = categoryCard.querySelector('.categoria-nome')?.textContent || 'Desconhecido';
      trackEvent('Categoria', 'clique', categoryName);
    }

    // Rastreia cliques em adicionar ao carrinho
    if (e.target.matches('.add-to-cart, .btn-adicionar-carrinho')) {
      const productName = document.querySelector('.product-name, h1')?.textContent || 'Produto';
      trackEvent('Carrinho', 'adicionar', productName);
    }

    // Rastreia cliques em favoritos
    if (e.target.matches('.add-to-favorites, .btn-favoritar')) {
      const productName = document.querySelector('.product-name, h1')?.textContent || 'Produto';
      trackEvent('Favoritos', 'adicionar', productName);
    }
  });

  // Rastreia submissão de busca
  const searchForms = document.querySelectorAll('form[action*="search"], .search-form');
  searchForms.forEach(function(form) {
    form.addEventListener('submit', function(e) {
      const searchInput = form.querySelector('input[type="search"], input[name="q"], input[name="query"]');
      if (searchInput && searchInput.value) {
        trackEvent('Pesquisa', 'busca', searchInput.value);
      }
    });
  });

  // Rastreia upload de imagem para identificação
  const uploadForms = document.querySelectorAll('form[action*="identificar"]');
  uploadForms.forEach(function(form) {
    form.addEventListener('submit', function(e) {
      trackEvent('Identificacao', 'upload', 'Foto enviada para análise');
    });
  });

  // Rastreia tempo na página (após 30 segundos)
  let timeOnPage = 0;
  const timeInterval = setInterval(function() {
    timeOnPage += 30;
    if (timeOnPage === 30) {
      trackEvent('Engagement', 'tempo_pagina', window.location.pathname, 30);
    } else if (timeOnPage === 60) {
      trackEvent('Engagement', 'tempo_pagina', window.location.pathname, 60);
    } else if (timeOnPage === 120) {
      trackEvent('Engagement', 'tempo_pagina', window.location.pathname, 120);
      clearInterval(timeInterval);
    }
  }, 30000);

  // Limpa intervalo ao sair da página
  window.addEventListener('beforeunload', function() {
    clearInterval(timeInterval);
  });

  // Rastreia scroll depth (25%, 50%, 75%, 100%)
  let scrollDepths = { 25: false, 50: false, 75: false, 100: false };
  window.addEventListener('scroll', function() {
    const scrollPercentage = Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100);
    
    Object.keys(scrollDepths).forEach(function(depth) {
      if (scrollPercentage >= depth && !scrollDepths[depth]) {
        scrollDepths[depth] = true;
        trackEvent('Engagement', 'scroll_depth', window.location.pathname, parseInt(depth));
      }
    });
  });

  console.log('✓ Sistema de rastreamento de eventos inicializado');
})();
