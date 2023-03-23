const express = require('express');
const rootRt = express.Router();
const RootCtrl = require('../controllers').rootCtrl;

rootRt.get('/', RootCtrl.getRoot);
rootRt.get('/:id', RootCtrl.getById);

module.exports = rootRt;