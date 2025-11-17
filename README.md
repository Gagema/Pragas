# PestControl Pro - Sistema de Controle de Pragas

Sistema web completo para gerenciamento de informações sobre pragas, métodos de controle e categorias. Desenvolvido com Node.js, Express, MySQL e Jade.

## 📋 Índice

- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
- [Configuração da Aplicação](#configuração-da-aplicação)
- [Executando o Projeto](#executando-o-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Troubleshooting](#troubleshooting)

## 🔧 Requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 14 ou superior)
  - Download: [https://nodejs.org/](https://nodejs.org/)
  - Verificar instalação: `node --version`

- **npm** (geralmente vem com Node.js)
  - Verificar instalação: `npm --version`

- **MySQL** (versão 5.7 ou superior, ou MariaDB 10.3+)
  - Download MySQL: [https://dev.mysql.com/downloads/](https://dev.mysql.com/downloads/)
  - Download MariaDB: [https://mariadb.org/download/](https://mariadb.org/download/)
  - Verificar instalação: `mysql --version`

- **Git** (opcional, para clonar o repositório)
  - Download: [https://git-scm.com/downloads](https://git-scm.com/downloads)

## 📦 Instalação

### 1. Clonar ou baixar o projeto

Se você tem o repositório Git:
```bash
git clone <url-do-repositorio>
cd Pragas
```

Ou simplesmente navegue até a pasta do projeto:
```bash
cd C:\Users\guimeds\Desktop\Pragas
```

### 2. Instalar dependências do Node.js

No diretório raiz do projeto, execute:

```bash
npm install
```

Isso instalará todas as dependências listadas no `package.json`:
- express
- mysql2
- bcrypt / bcryptjs
- express-session
- multer
- jade
- e outras...

**Tempo estimado:** 2-5 minutos (dependendo da velocidade da internet)

## 🗄️ Configuração do Banco de Dados

### 1. Instalar e configurar MySQL

1. Instale o MySQL Server seguindo as instruções do site oficial
2. Durante a instalação, anote a senha do usuário `root` que você configurou
3. Certifique-se de que o serviço MySQL está rodando:
   - **Windows:** Verifique no "Serviços" do Windows
   - **Linux/Mac:** `sudo systemctl status mysql` ou `brew services list`

### 2. Criar o banco de dados

1. Abra o MySQL Command Line Client ou MySQL Workbench
2. Execute o script SQL completo:

```bash
mysql -u root -p < database/schema.sql
```

Ou abra o arquivo `database/schema.sql` e execute todo o conteúdo no MySQL Workbench.

**O script criará:**
- Banco de dados `ecommerce`
- Tabelas: `usuarios`, `Praga`, `Categoria`, `Metodo`, `carrinho`, `favoritos`
- Estrutura completa com relacionamentos

### 3. Verificar criação do banco

```sql
USE ecommerce;
SHOW TABLES;
```

Você deve ver as tabelas criadas.

## ⚙️ Configuração da Aplicação

### 1. Configurar conexão com banco de dados

Edite o arquivo `db.js` na raiz do projeto:

```javascript
// db.js
const mysql = require('mysql2/promise');
const pool  = mysql.createPool({
  host: 'localhost',        // Altere se seu MySQL estiver em outro servidor
  user: 'root',             // Seu usuário MySQL
  password: 'root',         // SUA SENHA DO MYSQL (altere aqui!)
  database: 'ecommerce',    // Nome do banco criado
  waitForConnections: true,
  connectionLimit: 10
});
module.exports = pool;
```

**⚠️ IMPORTANTE:** Altere a `password` para a senha do seu MySQL!

### 2. Criar usuário administrador (opcional)

O projeto inclui um script para criar um usuário admin. Execute:

```bash
node createUser.js
```

Isso criará:
- **Usuário:** `admin`
- **Senha:** `admin123`
- **Função:** `admin`

**Nota:** Se o usuário já existir, o script não dará erro.

## 🚀 Executando o Projeto

### Método 1: Usando npm start (Recomendado)

```bash
npm start
```cd

### Método 2: Executando diretamente

```bash
node bin/www
```

### Método 3: Executando app.js diretamente

```bash
node app.js
```

**O servidor iniciará na porta 3210** (ou na porta definida na variável de ambiente `PORT`)

### Acessar a aplicação

Abra seu navegador e acesse:

```
http://localhost:3210
```

## 📁 Estrutura do Projeto

```
Pragas/
├── bin/
│   └── www                 # Script de inicialização do servidor
├── controllers/            # Lógica de negócio
│   ├── favoritosController.js
│   ├── productController.js
│   ├── metodoController.js
│   ├── categoriaController.js
│   └── carrinhoController.js
├── database/
│   └── schema.sql          # Script SQL para criar o banco
├── middleware/
│   └── authmiddleware.js   # Middleware de autenticação
├── models/
│   └── Product.js
├── public/                  # Arquivos estáticos (CSS, imagens)
│   ├── images/
│   └── stylesheets/
├── routes/                  # Definição de rotas
│   ├── authroute.js
│   ├── favoritos.js
│   ├── search.js
│   ├── products.js
│   └── ...
├── views/                   # Templates Jade
│   ├── index.jade
│   ├── favoritos.jade
│   ├── search.jade
│   ├── products/
│   └── ...
├── app.js                   # Arquivo principal da aplicação
├── db.js                    # Configuração do banco de dados
├── createUser.js            # Script para criar usuário admin
├── package.json             # Dependências do projeto
└── README.md               # Este arquivo
```

## ✨ Funcionalidades

### 🔍 Busca de Pragas
- Barra de busca visível no cabeçalho de todas as páginas públicas
- Busca por nome comum ou nome científico
- Página de resultados com cards clicáveis
- Acesso: `/search?q=termo`

### ❤️ Sistema de Favoritos
- Botão "Favoritar" na página de detalhes de cada praga
- Página dedicada para listar todos os favoritos
- Acesso rápido via menu (apenas para usuários logados)
- Acesso: `/favoritos`

### 👤 Autenticação
- Sistema de login e registro
- Sessões com duração de 1 hora
- Diferenciação entre usuários comuns e administradores
- Rotas protegidas com middleware

### 🛠️ Painel Administrativo
- Dashboard para administradores
- CRUD completo de Pragas, Métodos e Categorias
- Upload de imagens (imagem principal + galeria)
- Acesso: `/dashboardadmin` (requer login como admin)

### 📊 Gerenciamento de Conteúdo
- **Pragas:** Nome comum, nome científico, descrição, ciclo de vida, danos
- **Métodos:** Nome, descrição, princípios ativos, manejo integrado, dosagem, carência
- **Categorias:** Nome, descrição, imagem

## 🔐 Credenciais Padrão

Após executar `node createUser.js`:

- **Usuário Admin:**
  - Login: `admin`
  - Senha: `admin123`

## 🐛 Troubleshooting

### Erro: "Cannot find module 'mysql2'"
**Solução:** Execute `npm install` novamente

### Erro: "Access denied for user 'root'@'localhost'"
**Solução:** 
1. Verifique a senha no arquivo `db.js`
2. Certifique-se de que o MySQL está rodando
3. Teste a conexão: `mysql -u root -p`

### Erro: "Unknown database 'ecommerce'"
**Solução:** Execute o script `database/schema.sql` no MySQL

### Erro: "Port 3210 is already in use"
**Solução:** 
1. Feche outras instâncias do servidor
2. Ou altere a porta no `app.js` (linha 135): `const port = process.env.PORT || 3000;`

### Erro: "Table 'favoritos' doesn't exist"
**Solução:** Certifique-se de executar todo o `schema.sql`, incluindo a criação da tabela `favoritos`

### Imagens não aparecem
**Solução:** 
1. Verifique se a pasta `public/images/` existe
2. Certifique-se de que o servidor tem permissão de escrita nessa pasta
3. Verifique os caminhos das imagens no banco de dados

### Sessão não persiste
**Solução:** 
1. Verifique se os cookies estão habilitados no navegador
2. Certifique-se de que `express-session` está instalado: `npm install express-session`

## 📝 Variáveis de Ambiente (Opcional)

Você pode criar um arquivo `.env` para configurar:

```env
PORT=3210
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=ecommerce
```

E usar o pacote `dotenv` para carregar essas variáveis.

## 🔄 Comandos Úteis

```bash
# Instalar dependências
npm install

# Iniciar servidor
npm start

# Verificar sintaxe dos arquivos
node --check app.js
node --check controllers/productController.js

# Criar usuário admin
node createUser.js

# Verificar versão do Node
node --version

# Verificar versão do npm
npm --version
```

## 📚 Tecnologias Utilizadas

- **Backend:**
  - Node.js
  - Express.js
  - MySQL2 (driver MySQL)
  - Express-session (gerenciamento de sessões)
  - Multer (upload de arquivos)
  - Bcrypt (hash de senhas)

- **Frontend:**
  - Jade/Pug (templating engine)
  - CSS3
  - JavaScript (Vanilla)

- **Banco de Dados:**
  - MySQL

## 🎯 Rotas Principais

### Públicas
- `GET /` - Página inicial
- `GET /nossosprodutos` - Lista de pragas
- `GET /nossascategorias` - Lista de categorias
- `GET /nossosmetodos` - Lista de métodos
- `GET /search?q=termo` - Busca de pragas
- `GET /products/:id` - Detalhes de uma praga
- `GET /login` - Página de login
- `GET /register` - Página de registro

### Protegidas (requer login)
- `GET /favoritos` - Lista de favoritos do usuário
- `POST /favoritos/:id` - Adicionar favorito
- `DELETE /favoritos/:id` - Remover favorito
- `GET /products/new` - Criar nova praga (admin)
- `GET /products/:id/edit` - Editar praga (admin)
- `GET /dashboardadmin` - Dashboard administrativo (admin)

## 📞 Suporte

Se encontrar problemas:

1. Verifique se todas as dependências foram instaladas
2. Confirme que o MySQL está rodando
3. Verifique as credenciais no `db.js`
4. Execute o `schema.sql` novamente se necessário
5. Verifique os logs do console para mensagens de erro

## 📄 Licença

ISC

---

**Desenvolvido com ❤️ para controle eficiente de pragas**

