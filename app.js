var createError      = require('http-errors');
var express          = require('express');
var path             = require('path');
var cookieParser     = require('cookie-parser');
var logger           = require('morgan');
var session          = require('express-session');
var methodOverride   = require('method-override');

// Monitoramento e Analytics
const { initializeSentry, requestHandler, tracingHandler, errorHandler, captureError } = require('./middleware/errorTracking');
const { analyticsMiddleware } = require('./middleware/analytics');

// Conexão com pool MySQL via db.js
const pool           = require('./db');


// Importa rotas
var indexRouter      = require('./routes/index');
var usersRouter      = require('./routes/users');
var produtosRouter   = require('./routes/nossosprodutos');
var categoriaRouter   = require('./routes/categorias');
var metodoRouter   = require('./routes/metodos');
var categoriasRouter   = require('./routes/nossascategorias');
var metodosRouter   = require('./routes/nossosmetodos');
var carrinhoRouter   = require('./routes/carrinho');
var dashboardadminRouter = require('./routes/dashboardadmin');
const authRoutes     = require('./routes/authroute');
const { estaLogado, eAdmin } = require('./middleware/authmiddleware');
var productsRouter   = require('./routes/products');  // CRUD de produtos
var searchRouter     = require('./routes/search');
var favoritosRouter  = require('./routes/favoritos');
var identificarRouter = require('./routes/identificar');

var app = express();

// Inicializa Sentry (deve ser o primeiro middleware)
initializeSentry(app);
app.use(requestHandler());
app.use(tracingHandler());

//Css set
app.use('/css', express.static('stylesheets/form.css'));
app.use('/css', express.static('stylesheets/login.css'));
app.use('/css', express.static('stylesheets/product.css'));
app.use('/css', express.static('stylesheets/style.css'));


app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


// View engine setup (Jade)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.locals.basedir = path.join(__dirname, 'views');

// Logger HTTP (morgan)
app.use(logger('dev'));

// Parsers de corpo
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Suporte a método override para PUT/DELETE via forms
app.use(methodOverride('_method'));

// Logger custom para depuração de rotas e corpos
app.use((req, res, next) => {
  console.log(`→ Método: ${req.method} | URL: ${req.url} | Body:`, req.body);
  next();
});

// Outros middlewares
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({                                 
  secret: 'umSegredoBemSecreto',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Middleware de Analytics
app.use(analyticsMiddleware);

// Rotas de autenticação
app.use(authRoutes);

// Busca
app.use('/search', searchRouter);

// Identificar praga por foto
app.use('/identificar', identificarRouter);

// Favoritos (localStorage-driven client + data endpoint)
app.use('/favoritos', favoritosRouter);

// Rotas públicas
app.use('/', indexRouter);
app.use('/nossosprodutos', produtosRouter);
app.use('/nossascategorias', categoriasRouter);
app.use('/nossosmetodos', metodosRouter);

// CRUD de produtos
// Rotas protegidas p/ admin
app.use('/products', productsRouter);
app.use('/metodo', metodoRouter);
app.use('/categoria', categoriaRouter)

// Rotas protegidas p/ user logado
app.use('/users', usersRouter);
app.use('/carrinho', carrinhoRouter);

// Rota admin
app.get('/admin', estaLogado, eAdmin, (req, res) => {
  res.render('admin', { usuario: req.session.usuario });
});
app.use('/dashboardadmin', dashboardadminRouter);

// Exemplo de consulta direta usando pool
app.get('/select', estaLogado, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios');
    res.json(rows);
  } catch (err) {
    res.status(500).send('Erro na consulta');
  }
});

// catch 404 e forward para error handler
app.use((req, res, next) => next(createError(404)));

// Handler de erro do Sentry (deve vir antes do error handler padrão)
app.use(errorHandler());

// error handler
app.use((err, req, res, next) => {
  // Captura erro no Sentry
  captureError(err, {
    url: req.url,
    method: req.method,
    userId: req.session?.usuario?.id
  });
  
  res.locals.message = err.message;
  res.locals.error   = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Inicia o servidor
const port = process.env.PORT || 3210;
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));

module.exports = app;