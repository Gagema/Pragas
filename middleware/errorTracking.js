/**
 * Middleware de rastreamento de erros com Sentry
 * Captura e reporta erros para monitoramento em produção
 */

const Sentry = require('@sentry/node');

// Configuração do Sentry (adaptar com DSN real em produção)
function initializeSentry(app) {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      
      // Performance Monitoring
      tracesSampleRate: 0.1, // Captura 10% das transações para análise de performance
      
      // Informações adicionais
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app }),
      ],
      
      // Filtra informações sensíveis
      beforeSend(event, hint) {
        // Remove dados sensíveis antes de enviar
        if (event.request) {
          delete event.request.cookies;
          if (event.request.headers) {
            delete event.request.headers['authorization'];
            delete event.request.headers['cookie'];
          }
        }
        return event;
      },
    });

    console.log('✓ Sentry inicializado para monitoramento de erros');
  } else {
    console.log('⚠ Sentry não configurado (defina SENTRY_DSN em produção)');
  }
}

// Middleware para capturar requisições
function requestHandler() {
  return Sentry.Handlers.requestHandler();
}

// Middleware para capturar tracings
function tracingHandler() {
  return Sentry.Handlers.tracingHandler();
}

// Middleware para capturar erros
function errorHandler() {
  return Sentry.Handlers.errorHandler();
}

// Função para capturar erros manualmente
function captureError(error, context = {}) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, { extra: context });
  } else {
    console.error('Erro capturado:', error, context);
  }
}

// Função para capturar mensagens/eventos
function captureMessage(message, level = 'info', context = {}) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(message, { level, extra: context });
  } else {
    console.log(`[${level.toUpperCase()}] ${message}`, context);
  }
}

// Função para adicionar contexto do usuário
function setUserContext(userId, email, username) {
  Sentry.setUser({
    id: userId,
    email: email,
    username: username
  });
}

// Função para limpar contexto do usuário
function clearUserContext() {
  Sentry.setUser(null);
}

module.exports = {
  initializeSentry,
  requestHandler,
  tracingHandler,
  errorHandler,
  captureError,
  captureMessage,
  setUserContext,
  clearUserContext,
  Sentry
};
