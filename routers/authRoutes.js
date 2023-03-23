const express = require('express');
const authRt = express.Router();
const authCtrl = require('../controllers').authCtrl;

authRt.post('/register', authCtrl.register);
authRt.post('/login', authCtrl.login);

module.exports = authRt;