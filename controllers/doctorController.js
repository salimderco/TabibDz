const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Create or update doctor profile
// @route   POST /api/doctors
// @access  Private (Doctors only)
const createDoctorProfile = catchAsync(async (req, res, next) => {
    const {
        specialty,
        bio,
        city,
        address,
        phone,
        availableTimes,
        consultationFee,
        languages
    } = req.body;

    // Validate required fields
    if (!specialty || !bio || !city || !address || !phone || !consultationFee || !languages || !availableTimes) {
        return next(new AppError('Please provide all required fields', 400));
    }

    // Check if doctor profile already exists
    let doctor = await Doctor.findOne({ user: req.user._id });

    if (doctor) {
        // Update existing profile
        doctor = await Doctor.findOneAndUpdate(
            { user: req.user._id },
            {
                specialty,
                bio,
                city,
                address,
                phone,
                availableTimes,
                consultationFee,
                languages
            },
            { new: true, runValidators: true }
        ).populate('user', 'name email');
    } else {
        // Create new profile
        doctor = await Doctor.create({
            user: req.user._id,
            specialty,
            bio,
            city,
            address,
            phone,
            availableTimes,
            consultationFee,
            languages
        });
        doctor = await doctor.populate('user', 'name email');
    }

    res.status(201).json(doctor);
});

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = catchAsync(async (req, res, next) => {
    const doctor = await Doctor.findById(req.params.id)
        .populate('user', 'name email')
        .select('-__v');

    if (!doctor) {
        return next(new AppError('Doctor not found', 404));
    }

    res.json(doctor);
});

// @desc    Get all doctors with filters
// @route   GET /api/doctors
// @access  Public
const getAllDoctors = catchAsync(async (req, res, next) => {
    const {
        specialty,
        city,
        language,
        minRating,
        maxFee,
        available,
        page = 1,
        limit = 10
    } = req.query;

    const query = { active: true };

    // Apply filters
    if (specialty) query.specialty = specialty;
    if (city) query.city = city;
    if (language) query.languages = language;
    if (minRating) query['rating.average'] = { $gte: parseFloat(minRating) };
    if (maxFee) query.consultationFee = { $lte: parseFloat(maxFee) };
    if (available === 'true') query.active = true;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const doctors = await Doctor.find(query)
        .populate('user', 'name email')
        .select('-__v')
        .sort({ 'rating.average': -1 })
        .skip(skip)
        .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Doctor.countDocuments(query);

    res.json({
        doctors,
        pagination: {
            total,
            pages: Math.ceil(total / parseInt(limit)),
            page: parseInt(page),
            limit: parseInt(limit)
        }
    });
});

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private (Doctor only)
const updateDoctorProfile = catchAsync(async (req, res, next) => {
    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
        return next(new AppError('Doctor profile not found', 404));
    }

    // Update only provided fields
    const updates = {};
    const allowedUpdates = [
        'specialty',
        'bio',
        'city',
        'address',
        'phone',
        'availableTimes',
        'consultationFee',
        'languages',
        'active'
    ];

    Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
            updates[key] = req.body[key];
        }
    });

    const updatedDoctor = await Doctor.findOneAndUpdate(
        { user: req.user._id },
        { $set: updates },
        { new: true, runValidators: true }
    ).populate('user', 'name email');

    res.json(updatedDoctor);
});

// @desc    Get doctor's availability
// @route   GET /api/doctors/:id/availability
// @access  Public
const getDoctorAvailability = catchAsync(async (req, res, next) => {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
        return next(new AppError('Doctor not found', 404));
    }

    if (!doctor.active) {
        return next(new AppError('Doctor is not available for appointments', 400));
    }

    const { date } = req.query;
    if (!date) {
        return next(new AppError('Please provide a date', 400));
    }

    const availableSlots = doctor.getAvailableSlots(new Date(date));
    res.json({ availableSlots });
});

// Search doctors with filters
exports.searchDoctors = catchAsync(async (req, res) => {
  const {
    specialty,
    location,
    insurance,
    availability,
    rating,
    language
  } = req.query;

  const query = {};

  if (specialty) {
    query.specialty = specialty;
  }

  if (location) {
    query.$or = [
      { city: { $regex: location, $options: 'i' } },
      { address: { $regex: location, $options: 'i' } }
    ];
  }

  if (insurance) {
    query['insuranceAccepted.provider'] = insurance;
  }

  if (rating) {
    query.rating = { $gte: parseInt(rating) };
  }

  if (language) {
    query.languages = language;
  }

  if (availability) {
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
    query['availability.day'] = dayOfWeek;
    query['availability.isAvailable'] = true;
  }

  const doctors = await Doctor.find(query)
    .populate('user', 'name email')
    .sort({ rating: -1 });

  res.status(200).json({
    status: 'success',
    results: doctors.length,
    data: doctors
  });
});

// Get all doctors
exports.getAllDoctors = catchAsync(async (req, res) => {
  const doctors = await Doctor.find()
    .populate('user', 'name email');

  res.status(200).json({
    status: 'success',
    results: doctors.length,
    data: doctors
  });
});

// Get doctor by ID
exports.getDoctorById = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate('user', 'name email')
    .populate({
      path: 'reviews',
      populate: {
        path: 'patient',
        select: 'name'
      }
    });

  if (!doctor) {
    return next(new AppError('Doctor not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: doctor
  });
});

// Update doctor profile
exports.updateDoctorProfile = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(new AppError('Doctor not found', 404));
  }

  if (doctor.user.toString() !== req.user.id) {
    return next(new AppError('You can only update your own profile', 403));
  }

  const updatedDoctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('user', 'name email');

  res.status(200).json({
    status: 'success',
    data: updatedDoctor
  });
});

// Get doctor's availability
exports.getDoctorAvailability = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id)
    .select('availability');

  if (!doctor) {
    return next(new AppError('Doctor not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: doctor.availability
  });
});

// Update doctor's availability
exports.updateAvailability = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(new AppError('Doctor not found', 404));
  }

  if (doctor.user.toString() !== req.user.id) {
    return next(new AppError('You can only update your own availability', 403));
  }

  doctor.availability = req.body.availability;
  await doctor.save();

  res.status(200).json({
    status: 'success',
    data: doctor.availability
  });
});

// Get available slots for a specific date
exports.getAvailableSlots = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);
  const { date } = req.query;

  if (!doctor) {
    return next(new AppError('Doctor not found', 404));
  }

  const slots = await doctor.getAvailableSlots(date);

  res.status(200).json({
    status: 'success',
    data: slots
  });
});

// Get doctor's services
exports.getDoctorServices = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id)
    .select('services');

  if (!doctor) {
    return next(new AppError('Doctor not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: doctor.services
  });
});

// Add a new service
exports.addService = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(new AppError('Doctor not found', 404));
  }

  if (doctor.user.toString() !== req.user.id) {
    return next(new AppError('You can only add services to your own profile', 403));
  }

  doctor.services.push(req.body);
  await doctor.save();

  res.status(201).json({
    status: 'success',
    data: doctor.services
  });
});

// Update a service
exports.updateService = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(new AppError('Doctor not found', 404));
  }

  if (doctor.user.toString() !== req.user.id) {
    return next(new AppError('You can only update your own services', 403));
  }

  const serviceIndex = doctor.services.findIndex(
    service => service._id.toString() === req.params.serviceId
  );

  if (serviceIndex === -1) {
    return next(new AppError('Service not found', 404));
  }

  doctor.services[serviceIndex] = {
    ...doctor.services[serviceIndex],
    ...req.body
  };

  await doctor.save();

  res.status(200).json({
    status: 'success',
    data: doctor.services[serviceIndex]
  });
});

// Delete a service
exports.deleteService = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(new AppError('Doctor not found', 404));
  }

  if (doctor.user.toString() !== req.user.id) {
    return next(new AppError('You can only delete your own services', 403));
  }

  doctor.services = doctor.services.filter(
    service => service._id.toString() !== req.params.serviceId
  );

  await doctor.save();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Update online consultation settings
exports.updateOnlineConsultation = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(new AppError('Doctor not found', 404));
  }

  if (doctor.user.toString() !== req.user.id) {
    return next(new AppError('You can only update your own consultation settings', 403));
  }

  doctor.onlineConsultation = req.body;
  await doctor.save();

  res.status(200).json({
    status: 'success',
    data: doctor.onlineConsultation
  });
});

// @desc    Submit a review for a doctor
// @route   POST /api/doctors/:id/reviews
// @access  Private (Patients only)
const submitReview = catchAsync(async (req, res, next) => {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
        return next(new AppError('Doctor not found', 404));
    }

    // Check if the patient has had an appointment with this doctor
    const hasAppointment = await Appointment.findOne({
        doctor: req.params.id,
        patient: req.user.id,
        status: 'completed'
    });

    if (!hasAppointment) {
        return next(new AppError('You can only review doctors you have had appointments with', 403));
    }

    // Check if the patient has already reviewed this doctor
    const existingReview = doctor.reviews.find(
        review => review.patient.toString() === req.user.id
    );

    if (existingReview) {
        return next(new AppError('You have already reviewed this doctor', 400));
    }

    const review = {
        patient: req.user.id,
        rating: req.body.rating,
        comment: req.body.comment,
        visitDate: req.body.visitDate
    };

    doctor.reviews.push(review);
    await doctor.save();

    res.status(201).json({
        status: 'success',
        data: review
    });
});

// @desc    Get doctor's reviews
// @route   GET /api/doctors/:id/reviews
// @access  Public
const getDoctorReviews = catchAsync(async (req, res, next) => {
    const doctor = await Doctor.findById(req.params.id)
        .select('reviews')
        .populate({
            path: 'reviews.patient',
            select: 'name'
        });

    if (!doctor) {
        return next(new AppError('Doctor not found', 404));
    }

    res.status(200).json({
        status: 'success',
        results: doctor.reviews.length,
        data: doctor.reviews
    });
});

// @desc    Get doctor's appointments
// @route   GET /api/doctors/:id/appointments
// @access  Private (Doctor only)
const getDoctorAppointments = catchAsync(async (req, res, next) => {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
        return next(new AppError('Doctor not found', 404));
    }

    if (doctor.user.toString() !== req.user.id) {
        return next(new AppError('You can only view your own appointments', 403));
    }

    const appointments = await Appointment.find({ doctor: req.params.id })
        .populate('patient', 'name email')
        .sort({ date: 1 });

    res.status(200).json({
        status: 'success',
        results: appointments.length,
        data: appointments
    });
});

// @desc    Book an appointment with a doctor
// @route   POST /api/doctors/:id/appointments
// @access  Private (Patients only)
const bookAppointment = catchAsync(async (req, res, next) => {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
        return next(new AppError('Doctor not found', 404));
    }

    // Check if the slot is available
    const isAvailable = doctor.isTimeSlotAvailable(req.body.date, req.body.time);
    if (!isAvailable) {
        return next(new AppError('This time slot is not available', 400));
    }

    const appointment = await Appointment.create({
        doctor: req.params.id,
        patient: req.user.id,
        date: req.body.date,
        time: req.body.time,
        service: req.body.service,
        status: 'pending'
    });

    res.status(201).json({
        status: 'success',
        data: appointment
    });
});

// @desc    Update appointment status
// @route   PUT /api/doctors/:id/appointments/:appointmentId
// @access  Private (Doctor only)
const updateAppointmentStatus = catchAsync(async (req, res, next) => {
    const doctor = await Doctor.findById(req.params.id);
    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!doctor || !appointment) {
        return next(new AppError('Doctor or appointment not found', 404));
    }

    if (doctor.user.toString() !== req.user.id) {
        return next(new AppError('You can only update your own appointments', 403));
    }

    if (appointment.doctor.toString() !== req.params.id) {
        return next(new AppError('This appointment does not belong to you', 403));
    }

    appointment.status = req.body.status;
    await appointment.save();

    res.status(200).json({
        status: 'success',
        data: appointment
    });
});

// @desc    Get doctor's insurance information
// @route   GET /api/doctors/:id/insurance
// @access  Public
const getDoctorInsurance = catchAsync(async (req, res, next) => {
    const doctor = await Doctor.findById(req.params.id)
        .select('insuranceAccepted');

    if (!doctor) {
        return next(new AppError('Doctor not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: doctor.insuranceAccepted
    });
});

// @desc    Update doctor's insurance information
// @route   PUT /api/doctors/:id/insurance
// @access  Private (Doctor only)
const updateDoctorInsurance = catchAsync(async (req, res, next) => {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
        return next(new AppError('Doctor not found', 404));
    }

    if (doctor.user.toString() !== req.user.id) {
        return next(new AppError('You can only update your own insurance information', 403));
    }

    doctor.insuranceAccepted = req.body.insuranceAccepted;
    await doctor.save();

    res.status(200).json({
        status: 'success',
        data: doctor.insuranceAccepted
    });
});

module.exports = {
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
}; 