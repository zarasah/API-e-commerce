const express = require('express');
const router = express.Router();
const Controllers = require('../controllers/controllers');
const { authenticateToken } = require('../functions/authenticateToken');

router.get('/', Controllers.getRoot);
router.get('/showcart', Controllers.showCart);
router.get('/:id', Controllers.getById);
router.post('/register', Controllers.register);
router.post('/login', Controllers.login);
router.post('/addtocart', authenticateToken, Controllers.addToCart);
router.post('/createproduct', authenticateToken, Controllers.createProduct);
router.put('/updateproduct', authenticateToken, Controllers.updateProdut);
router.delete('/deleteproduct', authenticateToken, Controllers.deleteProduct);

module.exports = router;