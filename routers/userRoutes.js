const express = require('express');
const userRt = express.Router();
const userCtrl = require('../controllers').userCtrl;
const { authenticateToken } = require('../middlewares/authenticateToken');

userRt.get('/showcart', authenticateToken, userCtrl.showCart);
userRt.post('/addtocart', authenticateToken, userCtrl.addToCart);

module.exports = userRt;