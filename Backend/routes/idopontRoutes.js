const express = require('express');
const router = express.Router();
const idopontController = require('../controllers/idopontController');

router.get('/', idopontController.getAllAppointments);
router.post('/', idopontController.createAppointment);
router.delete('/cleanup', idopontController.deleteOldAppointments); // Fontos: az /:id előtt legyen!
router.get('/user/:id', idopontController.getAppointmentsByUser);   // Saját időpontok lekérése
router.post('/cancel/:id', idopontController.cancelAppointment);    // Lemondás (POST, mert adatot is küldünk)
router.delete('/:id', idopontController.deleteAppointment);

module.exports = router;