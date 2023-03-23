const express = require('express');
const router = express.Router();
const rootRt = require('./rootRoutes');
const authRt = require('./authRoutes');
const userRt = require('./userRoutes');
const adminRt = require('./adminRoutes');

router.use(userRt);
router.use(rootRt);
router.use(authRt);
router.use(adminRt);

module.exports = router;