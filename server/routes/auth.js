const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { validateRegister, validateLogin, validate } = require('../middleware/validation');

router.post('/register', validateRegister, validate, register);
router.post('/login', validateLogin, validate, login);
router.get('/profile', auth, getProfile);

module.exports = router;