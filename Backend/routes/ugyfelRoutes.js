const express = require('express');
const router = express.Router();
const ugyfelController = require('../controllers/ugyfelController');

router.post('/register', ugyfelController.regisztracio);
router.post('/login', ugyfelController.bejelentkezes);

router.get('/', ugyfelController.getAllUsers);       // Lista
router.put('/:id', ugyfelController.updateUser);     // Módosítás
router.delete('/:id', ugyfelController.deleteUser);  // Törlés

module.exports = router;