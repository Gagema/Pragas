function estaLogado(req, res, next) {
    if (req.session.usuario) {
      return next();
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