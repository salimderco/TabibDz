const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't return password in queries by default
    },
    role: {
        type: String,
        enum: {
            values: ['patient', 'doctor'],
            message: '{VALUE} is not a valid role'
        },
        default: 'patient'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    try {
        // Only hash the password if it has been modified (or is new)
        if (!this.isModified('password')) return next();

        // Generate salt with cost factor 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        // Need to select password explicitly since we have select: false
        const user = await this.model('User').findById(this._id).select('+password');
        return await bcrypt.compare(candidatePassword, user.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Update lastLogin
userSchema.methods.updateLastLogin = async function() {
    this.lastLogin = new Date();
    return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User; 