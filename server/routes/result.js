const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const {
  submitResult,
  getUserResults,
  getAllResults,
  getResultById
} = require('../controllers/resultController');

router.post('/', auth, submitResult);
router.get('/user', auth, getUserResults);
router.get('/all', auth, admin, getAllResults);
router.get('/:id', auth, getResultById);

module.exports = router;