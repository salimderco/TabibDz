const express = require('express');
const {
    createAppointment,
    getAppointmentsByUser,
    getAppointmentsByDoctor,
    cancelAppointment,
    updateAppointmentStatus
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Patient routes
router.post('/', protect, authorize('patient'), createAppointment);
router.get('/patient', protect, authorize('patient'), getAppointmentsByUser);

// Doctor routes
router.get('/doctor', protect, authorize('doctor'), getAppointmentsByDoctor);
router.patch('/:id/status', protect, authorize('doctor'), updateAppointmentStatus);

// Shared routes (both patient and doctor)
router.delete('/:id', protect, cancelAppointment);

module.exports = router; 