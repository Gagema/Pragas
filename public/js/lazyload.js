// public/js/lazyload.js
// Sistema de lazy loading para imagens
// Carrega imagens apenas quando estão visíveis no viewport

(function() {
  'use strict';
  
  // Configuração
  const config = {
    rootMargin: '50px', // Começa a carregar 50px antes de entrar no viewport
    threshold: 0.01,
    loadingClass: 'lazy-loading',
    loadedClass: 'lazy-loaded',
    errorClass: 'lazy-error'
  };
  
  // Verifica suporte a IntersectionObserver
  const supportsIntersectionObserver = 'IntersectionObserver' in window;
  
  /**
   * Carrega imagem
   */
  function loadImage(img) {
    // Adiciona classe de loading
    img.classList.add(config.loadingClass);
    
    // Cria elemento temporário para pré-carregar
    const tempImg = new Image();
    
    tempImg.onload = function() {
      // Define src da imagem real
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
      
      // Define srcset se disponível
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
      }
      
      // Remove classe de loading e adiciona loaded
      img.classList.remove(config.loadingClass);
      img.classList.add(config.loadedClass);
      
      // Remove atributos data-*
      delete img.dataset.src;
      delete img.dataset.srcset;
    };
    
    tempImg.onerror = function() {
      img.classList.remove(config.loadingClass);
      img.classList.add(config.errorClass);
      console.error('Erro ao carregar imagem:', img.dataset.src);
    };
    
    // Inicia carregamento
    tempImg.src = img.dataset.src;
    if (img.dataset.srcset) {
      tempImg.srcset = img.dataset.srcset;
    }
  }
  
  /**
   * Inicializa lazy loading com IntersectionObserver
   */
  function initIntersectionObserver() {
    const images = document.querySelectorAll('img[data-src], img[data-srcset]');
    
    if (images.length === 0) return;
    
    const observer = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          loadImage(img);
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: config.rootMargin,
      threshold: config.threshold
    });
    
    images.forEach(function(img) {
      observer.observe(img);
    });
    
    console.log(`✓ Lazy loading inicializado para ${images.length} imagens`);
  }
  
  /**
   * Fallback para navegadores sem IntersectionObserver
   */
  function initScrollListener() {
    const images = Array.from(document.querySelectorAll('img[data-src], img[data-srcset]'));
    
    if (images.length === 0) return;
    
    function checkImages() {
      images.forEach(function(img, index) {
        if (isInViewport(img)) {
          loadImage(img);
          images.splice(index, 1);
        }
      });
      
      // Remove listener se todas as imagens foram carregadas
      if (images.length === 0) {
        window.removeEventListener('scroll', throttledCheck);
        window.removeEventListener('resize', throttledCheck);
      }
    }
    
    function isInViewport(element) {
      const rect = element.getBoundingClientRect();
      const margin = parseInt(config.rootMargin);
      
      return (
        rect.top >= -margin &&
        rect.left >= -margin &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + margin &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) + margin
      );
    }
    
    // Throttle para não executar a cada scroll
    let ticking = false;
    function throttledCheck() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          checkImages();
          ticking = false;
        });
        ticking = true;
      }
    }
    
    window.addEventListener('scroll', throttledCheck, { passive: true });
    window.addEventListener('resize', throttledCheck, { passive: true });
    
    // Verifica imagens inicialmente visíveis
    checkImages();
    
    console.log(`✓ Lazy loading (fallback) inicializado para ${images.length} imagens`);
  }
  
  /**
   * Adiciona suporte a WebP
   */
  function checkWebPSupport() {
    return new Promise(function(resolve) {
      const webP = new Image();
      webP.onload = webP.onerror = function() {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }
  
  /**
   * Substitui extensão de imagem por WebP se suportado
   */
  async function enableWebP() {
    const supportsWebP = await checkWebPSupport();
    
    if (supportsWebP) {
      document.documentElement.classList.add('webp');
      
      // Substitui URLs de imagens para WebP
      const images = document.querySelectorAll('img[data-src]');
      images.forEach(function(img) {
        const src = img.dataset.src;
        if (src && /\.(jpe?g|png)$/i.test(src)) {
          img.dataset.src = src.replace(/\.(jpe?g|png)$/i, '.webp');
          img.dataset.srcFallback = src; // Guarda fallback
        }
      });
      
      console.log('✓ WebP suportado e habilitado');
    } else {
      document.documentElement.classList.add('no-webp');
      console.log('✓ WebP não suportado, usando formatos tradicionais');
    }
  }
  
  /**
   * Pré-carrega imagens críticas
   */
  function preloadCriticalImages() {
    const criticalImages = document.querySelectorAll('img[data-critical]');
    
    criticalImages.forEach(function(img) {
      loadImage(img);
    });
    
    if (criticalImages.length > 0) {
      console.log(`✓ ${criticalImages.length} imagens críticas pré-carregadas`);
    }
  }
  
  /**
   * Inicialização
   */
  async function init() {
    // Verifica suporte a WebP
    await enableWebP();
    
    // Pré-carrega imagens críticas
    preloadCriticalImages();
    
    // Inicializa lazy loading
    if (supportsIntersectionObserver) {
      initIntersectionObserver();
    } else {
      initScrollListener();
    }
  }
  
  // Inicializa quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Expõe funções globalmente para uso manual
  window.LazyLoad = {
    init: init,
    loadImage: loadImage
  };
  
})();
