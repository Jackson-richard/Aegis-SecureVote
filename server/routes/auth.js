const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/verify-qr', authController.verifyQR);
router.post('/login', authController.login); // Stub
router.post('/register', authController.register); // Stub

module.exports = router;
