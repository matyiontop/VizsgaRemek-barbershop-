const express = require('express');
const router = express.Router();
const ugyfelController = require('../controllers/ugyfelController');

// Útvonalak definiálása
router.post('/regisztracio', ugyfelController.regisztracio);
router.post('/bejelentkezes', ugyfelController.bejelentkezes);

module.exports = router;