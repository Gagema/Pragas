// Arquivo: createUser.js
const bcrypt = require('bcrypt');
const pool = require('./db'); // Importa sua conexão do db.js

async function createAdmin() {
  console.log('Iniciando criação do admin...');
  try {
    const usuario = 'admin';
    const senhaPlana = 'admin123'; // Senha que você vai usar para logar
    const funcao = 'admin';

    // Gera o "hash" da senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senhaPlana, salt);

    // Insere no banco de dados
    await pool.execute(
      `INSERT INTO usuarios (usuario, senha, funcao) VALUES (?, ?, ?)`,
      [usuario, senhaHash, funcao]
    );
    
    console.log('Sucesso! Usuário "admin" com senha "admin123" foi criado.');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.log('Erro: Usuário "admin" já existe.');
    } else {
      console.error('Erro ao criar usuário:', err);
    }
  }
  pool.end(); // Fecha a conexão
}

createAdmin();