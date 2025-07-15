const mongoose = require('mongoose');

// تعريف مخطط الوقت المتاح
const timeSlotSchema = new mongoose.Schema({
    day: {
        type: String,
        required: true,
        enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    isBooked: {
        type: Boolean,
        default: false
    }
});

// تعريف مخطط التقييمات
const reviewSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const availabilitySchema = new mongoose.Schema({
    day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    slotDuration: {
        type: Number,
        required: true,
        default: 30 // minutes
    }
});

const doctorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    specialty: {
        type: String,
        required: [true, 'Specialty is required'],
        trim: true
    },
    bio: {
        type: String,
        required: [true, 'Bio is required'],
        trim: true,
        maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        enum: {
            values: ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Setif', 'Batna', 'Other'],
            message: '{VALUE} is not a supported city'
        }
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^(\+213|0)(5|6|7)[0-9]{8}$/, 'Please enter a valid Algerian phone number']
    },
    availableTimes: {
        type: [timeSlotSchema],
        validate: {
            validator: function(times) {
                return times.length > 0;
            },
            message: 'At least one time slot is required'
        }
    },
    consultationFee: {
        type: Number,
        required: [true, 'Consultation fee is required'],
        min: [0, 'Consultation fee cannot be negative']
    },
    languages: {
        type: [{
            type: String,
            enum: {
                values: ['Arabic', 'French', 'English'],
                message: '{VALUE} is not a supported language'
            }
        }],
        validate: {
            validator: function(langs) {
                return langs.length > 0;
            },
            message: 'At least one language is required'
        }
    },
    active: {
        type: Boolean,
        default: true
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    qualifications: [{
        degree: {
            type: String,
            required: true
        },
        institution: {
            type: String,
            required: true
        },
        year: {
            type: Number,
            required: true
        }
    }],
    experience: {
        type: Number,
        required: true,
        min: 0
    },
    insuranceAccepted: [{
        provider: {
            type: String,
            required: true
        },
        planTypes: [{
            type: String
        }]
    }],
    availability: [availabilitySchema],
    reviews: [reviewSchema],
    reviewsCount: {
        type: Number,
        default: 0
    },
    about: {
        type: String,
        maxlength: 1000
    },
    specializations: [{
        type: String
    }],
    services: [{
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        fee: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    education: [{
        type: {
            type: String,
            required: true,
            enum: ['Medical School', 'Residency', 'Fellowship', 'Other']
        },
        institution: {
            type: String,
            required: true
        },
        field: String,
        startYear: Number,
        endYear: Number
    }],
    awards: [{
        title: {
            type: String,
            required: true
        },
        year: Number,
        description: String
    }],
    memberships: [{
        organization: {
            type: String,
            required: true
        },
        startYear: Number,
        endYear: Number
    }],
    onlineConsultation: {
        available: {
            type: Boolean,
            default: false
        },
        fee: {
            type: Number,
            min: 0
        },
        platform: {
            type: String,
            enum: ['Zoom', 'Google Meet', 'Skype', 'Other']
        }
    }
}, {
    timestamps: true
});

// Indexes for searching and filtering
doctorSchema.index({ specialty: 1, city: 1, active: 1 });
doctorSchema.index({ 'rating.average': -1 });

// Virtual for full name
doctorSchema.virtual('fullName').get(function() {
    return `Dr. ${this.user.name}`;
});

// Method to check if a time slot is available
doctorSchema.methods.isTimeSlotAvailable = function(date, time) {
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const dayAvailability = this.availability.find(a => a.day === dayOfWeek);
    
    if (!dayAvailability || !dayAvailability.isAvailable) {
        return false;
    }

    const [hours, minutes] = time.split(':').map(Number);
    const slotTime = new Date(date);
    slotTime.setHours(hours, minutes);

    const [startHours, startMinutes] = dayAvailability.startTime.split(':').map(Number);
    const [endHours, endMinutes] = dayAvailability.endTime.split(':').map(Number);

    const startTime = new Date(date);
    startTime.setHours(startHours, startMinutes);

    const endTime = new Date(date);
    endTime.setHours(endHours, endMinutes);

    return slotTime >= startTime && slotTime <= endTime;
};

// Method to get all available slots for a given date
doctorSchema.methods.getAvailableSlots = function(date) {
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const dayAvailability = this.availability.find(a => a.day === dayOfWeek);
    
    if (!dayAvailability || !dayAvailability.isAvailable) {
        return [];
    }

    const slots = [];
    const [startHours, startMinutes] = dayAvailability.startTime.split(':').map(Number);
    const [endHours, endMinutes] = dayAvailability.endTime.split(':').map(Number);
    
    let currentSlot = new Date(date);
    currentSlot.setHours(startHours, startMinutes, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(endHours, endMinutes, 0, 0);

    while (currentSlot <= endTime) {
        slots.push(currentSlot.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        }));
        currentSlot = new Date(currentSlot.getTime() + dayAvailability.slotDuration * 60000);
    }

    return slots;
};

// Method to update rating
doctorSchema.methods.updateRating = async function(newRating) {
    const oldTotal = this.rating.average * this.rating.count;
    this.rating.count += 1;
    this.rating.average = (oldTotal + newRating) / this.rating.count;
    return this.save();
};

// Calculate average rating when a review is added or modified
doctorSchema.pre('save', function(next) {
    if (this.reviews && this.reviews.length > 0) {
        const totalRating = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        this.rating.average = totalRating / this.reviews.length;
        this.rating.count = this.reviews.length;
        this.reviewsCount = this.reviews.length;
    }
    next();
});

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor; 