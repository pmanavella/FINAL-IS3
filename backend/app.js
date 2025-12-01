const express = require('express');
const cors = require('cors');
const routes = require('./routes'); // si tenés router, si no, dejá tus endpoints acá

const app = express();
app.use(cors());
app.use(express.json());

// ejemplo: app.get('/api/health', (req,res)=>res.json({ok:true}));
/* monta aquí todas tus rutas /api/books, /api/loans, /api/sales */

module.exports = app;
