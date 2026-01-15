const express = require('express');
const router = express.Router();
const szolgaltatasController = require('../controllers/szolgaltatasController');

router.get('/', szolgaltatasController.getAllServices);

module.exports = router;