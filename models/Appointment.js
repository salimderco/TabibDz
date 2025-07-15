const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        validate: {
            validator: async function(value) {
                const user = await this.model('User').findById(value);
                return user && user.role === 'patient';
            },
            message: 'Invalid patient ID or user is not a patient'
        }
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    date: {
        type: Date,
        required: [true, 'Appointment date is required'],
        validate: {
            validator: function(value) {
                return value > new Date();
            },
            message: 'Appointment date must be in the future'
        }
    },
    time: {
        type: String,
        required: [true, 'Appointment time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)']
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'confirmed', 'cancelled', 'completed'],
            message: '{VALUE} is not a valid status'
        },
        default: 'pending'
    },
    reason: {
        type: String,
        required: [true, 'Reason for visit is required'],
        trim: true,
        maxlength: [200, 'Reason cannot be more than 200 characters']
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot be more than 500 characters']
    },
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    cancelReason: {
        type: String,
        trim: true,
        maxlength: [200, 'Cancel reason cannot be more than 200 characters']
    },
    reminderSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
appointmentSchema.index({ doctor: 1, date: 1, time: 1 }, { unique: true });
appointmentSchema.index({ patient: 1, date: 1 });
appointmentSchema.index({ status: 1 });

// Middleware to check doctor availability before saving
appointmentSchema.pre('save', async function(next) {
    try {
        if (this.isModified('date') || this.isModified('time') || this.isModified('status')) {
            const doctor = await this.model('Doctor').findById(this.doctor);
            if (!doctor) {
                throw new Error('Doctor not found');
            }

            // Check if doctor is available
            if (!doctor.isAvailable) {
                throw new Error('Doctor is not available for appointments');
            }

            // Only check availability for new or rescheduled appointments
            if ((this.isNew || this.isModified('date') || this.isModified('time')) && 
                this.status !== 'cancelled') {
                
                // Check if the slot is available using the doctor's helper method
                if (!doctor.isTimeSlotAvailable(this.date, this.time)) {
                    throw new Error('Selected time slot is not available');
                }

                // Check for conflicting appointments
                const conflicting = await this.constructor.findOne({
                    doctor: this.doctor,
                    date: this.date,
                    time: this.time,
                    status: { $nin: ['cancelled'] },
                    _id: { $ne: this._id } // Exclude current appointment for updates
                });

                if (conflicting) {
                    throw new Error('This time slot is already booked');
                }
            }
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Static method to check availability
appointmentSchema.statics.checkAvailability = async function(doctorId, date, time) {
    const existing = await this.findOne({
        doctor: doctorId,
        date: date,
        time: time,
        status: { $nin: ['cancelled'] }
    });
    return !existing;
};

// Method to cancel appointment
appointmentSchema.methods.cancelAppointment = async function(userId, reason) {
    if (this.status === 'completed') {
        throw new Error('Cannot cancel a completed appointment');
    }
    
    this.status = 'cancelled';
    this.cancelledBy = userId;
    this.cancelReason = reason;
    return this.save();
};

// Method to complete appointment
appointmentSchema.methods.completeAppointment = async function() {
    if (this.status !== 'confirmed') {
        throw new Error('Only confirmed appointments can be completed');
    }
    
    if (this.date > new Date()) {
        throw new Error('Cannot complete a future appointment');
    }
    
    this.status = 'completed';
    return this.save();
};

// Method to reschedule appointment
appointmentSchema.methods.reschedule = async function(newDate, newTime) {
    if (this.status === 'completed' || this.status === 'cancelled') {
        throw new Error(`Cannot reschedule a ${this.status} appointment`);
    }
    
    if (newDate < new Date()) {
        throw new Error('Cannot reschedule to a past date');
    }
    
    this.date = newDate;
    this.time = newTime;
    return this.save();
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment; 