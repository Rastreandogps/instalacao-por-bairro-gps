const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

// Configuração para arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota padrão para index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {
  console.log('🚀 Servidor rodando em http://localhost:3000');
});