const express = require('express');
const {
    createDoctorProfile,
    getDoctorById,
    getAllDoctors,
    updateDoctorProfile,
    getDoctorAvailability,
    submitReview,
    getDoctorReviews,
    getDoctorAppointments,
    bookAppointment,
    updateAppointmentStatus,
    getDoctorInsurance,
    updateDoctorInsurance
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/reviews', getDoctorReviews);

// Protected routes (doctors only)
router.post('/', protect, authorize('doctor'), createDoctorProfile);
router.put('/profile', protect, authorize('doctor'), updateDoctorProfile);
router.get('/:id/availability', getDoctorAvailability);
router.post('/:id/reviews', protect, authorize('patient'), submitReview);
router.get('/:id/appointments', protect, authorize('doctor'), getDoctorAppointments);
router.post('/:id/appointments', protect, authorize('patient'), bookAppointment);
router.put('/:id/appointments/:appointmentId', protect, authorize('doctor'), updateAppointmentStatus);
router.get('/:id/insurance', getDoctorInsurance);
router.put('/:id/insurance', protect, authorize('doctor'), updateDoctorInsurance);

module.exports = router; 