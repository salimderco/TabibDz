const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Patients only)
const createAppointment = async (req, res) => {
    try {
        const { doctorId, date, time, reason } = req.body;

        // Validate required fields
        if (!doctorId || !date || !time || !reason) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        // Check if doctor exists and is available
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        if (!doctor.isAvailable) {
            return res.status(400).json({ error: 'Doctor is not available for appointments' });
        }

        // Validate appointment date
        const appointmentDate = new Date(date);
        if (appointmentDate < new Date()) {
            return res.status(400).json({ error: 'Appointment date must be in the future' });
        }

        // Check doctor's availability for the time slot
        const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][appointmentDate.getDay()];
        if (!doctor.isTimeSlotAvailable(dayOfWeek, time)) {
            return res.status(400).json({ error: 'Selected time slot is not available' });
        }

        // Check if slot is already booked
        const isAvailable = await Appointment.checkAvailability(doctorId, appointmentDate, time);
        if (!isAvailable) {
            return res.status(400).json({ error: 'This time slot is already booked' });
        }

        // Create appointment
        const appointment = await Appointment.create({
            patient: req.user._id,
            doctor: doctorId,
            date: appointmentDate,
            time,
            reason
        });

        await appointment.populate([
            { path: 'patient', select: 'name email' },
            { path: 'doctor', populate: { path: 'user', select: 'name email' } }
        ]);

        res.status(201).json(appointment);
    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({ error: 'Could not create appointment' });
    }
};

// @desc    Get appointments for logged-in patient
// @route   GET /api/appointments/patient
// @access  Private (Patients only)
const getAppointmentsByUser = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patient: req.user._id })
            .populate([
                { path: 'patient', select: 'name email' },
                { path: 'doctor', populate: { path: 'user', select: 'name email' } }
            ])
            .sort({ date: 1, time: 1 });

        res.json(appointments);
    } catch (error) {
        console.error('Get patient appointments error:', error);
        res.status(500).json({ error: 'Could not retrieve appointments' });
    }
};

// @desc    Get appointments for logged-in doctor
// @route   GET /api/appointments/doctor
// @access  Private (Doctors only)
const getAppointmentsByDoctor = async (req, res) => {
    try {
        // Get doctor profile
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor profile not found' });
        }

        const { status, date } = req.query;
        const query = { doctor: doctor._id };

        // Filter by status if provided
        if (status) {
            query.status = status;
        }

        // Filter by date if provided
        if (date) {
            const searchDate = new Date(date);
            query.date = {
                $gte: searchDate,
                $lt: new Date(searchDate.setDate(searchDate.getDate() + 1))
            };
        }

        const appointments = await Appointment.find(query)
            .populate([
                { path: 'patient', select: 'name email' },
                { path: 'doctor', populate: { path: 'user', select: 'name email' } }
            ])
            .sort({ date: 1, time: 1 });

        res.json(appointments);
    } catch (error) {
        console.error('Get doctor appointments error:', error);
        res.status(500).json({ error: 'Could not retrieve appointments' });
    }
};

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private (Patients and Doctors)
const cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Check if user is authorized to cancel
        const isPatient = appointment.patient.toString() === req.user._id.toString();
        const isDoctor = await Doctor.exists({ user: req.user._id, _id: appointment.doctor });

        if (!isPatient && !isDoctor) {
            return res.status(403).json({ error: 'Not authorized to cancel this appointment' });
        }

        // Check if appointment can be cancelled
        if (appointment.status === 'cancelled') {
            return res.status(400).json({ error: 'Appointment is already cancelled' });
        }
        if (appointment.status === 'completed') {
            return res.status(400).json({ error: 'Cannot cancel a completed appointment' });
        }

        // Cancel appointment
        const { cancelReason } = req.body;
        await appointment.cancelAppointment(req.user._id, cancelReason);

        res.json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({ error: 'Could not cancel appointment' });
    }
};

// @desc    Update appointment status
// @route   PATCH /api/appointments/:id/status
// @access  Private (Doctors only)
const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['confirmed', 'completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Verify doctor owns this appointment
        const isDoctor = await Doctor.exists({ user: req.user._id, _id: appointment.doctor });
        if (!isDoctor) {
            return res.status(403).json({ error: 'Not authorized to update this appointment' });
        }

        appointment.status = status;
        await appointment.save();

        res.json({ message: 'Appointment status updated successfully' });
    } catch (error) {
        console.error('Update appointment status error:', error);
        res.status(500).json({ error: 'Could not update appointment status' });
    }
};

module.exports = {
    createAppointment,
    getAppointmentsByUser,
    getAppointmentsByDoctor,
    cancelAppointment,
    updateAppointmentStatus
}; 