function estaLogado(req, res, next) {
  if (req.session.usuario) {
    return next();
  }
  // Se for um pedido de API (espera JSON), envie 401. Senão, redirecione para o login.
  if (req.accepts('json')) {
    return res.status(401).json({ error: 'login_required' });
  }
  res.redirect('/login');
}
  
  function eAdmin(req, res, next) {
    if (req.session.usuario?.funcao === 'admin') {
      return next();
    }
    res.status(403).send('Acesso negado');
  }
  
  module.exports = { estaLogado, eAdmin };