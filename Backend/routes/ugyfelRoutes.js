const express = require('express');
const router = express.Router();
const ugyfelController = require('../controllers/ugyfelController');

// A POST /api/ugyfelek/register hívás ide fut be
router.post('/register', ugyfelController.regisztracio);
router.post('/login', ugyfelController.bejelentkezes);

module.exports = router;