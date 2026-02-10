const express = require('express');
const router = express.Router();
const idopontController = require('../controllers/idopontController');

router.get('/', idopontController.getAllAppointments);
router.post('/', idopontController.createAppointment);
router.delete('/:id', idopontController.deleteAppointment);

module.exports = router;