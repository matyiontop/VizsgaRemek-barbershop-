const express = require('express');
const router = express.Router();
const fodraszController = require('../controllers/fodraszController');

router.get('/', fodraszController.getAllHairdressers);

module.exports = router;