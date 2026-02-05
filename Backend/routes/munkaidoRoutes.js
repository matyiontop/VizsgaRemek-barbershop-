const express = require('express');
const router = express.Router();
const munkaidoController = require('../controllers/munkaidoController');

router.get('/', munkaidoController.getWorkHours);

module.exports = router;