const express = require('express');
const adminRt = express.Router();
const adminCtrl = require('../controllers').adminCtrl;
const { authenticateToken } = require('../middlewares/authenticateToken');

adminRt.post('/createproduct', authenticateToken, adminCtrl.createProduct);
adminRt.put('/updateproduct', authenticateToken, adminCtrl.updateProdut);
adminRt.delete('/deleteproduct', authenticateToken, adminCtrl.deleteProduct);

module.exports = adminRt;