const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/verify-qr', authController.verifyQR);
router.post('/bind-wallet', authController.bindWallet);
router.post('/login', authController.login);
router.post('/register', authController.register);

module.exports = router;
