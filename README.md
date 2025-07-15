<<<<<<< HEAD
# TbibDz - Medical Appointment System

## Prerequisites

1. **Install Node.js and npm**
   - Download Node.js from: https://nodejs.org/en/ (LTS version)
   - Run the installer
   - After installation, restart your computer

2. **Install MongoDB**
   - Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
   - During installation:
     - Choose "Complete" installation
     - Install MongoDB Compass (the GUI tool)
     - Let it install as a service

## Project Setup

1. **Environment Variables**
   Create a `.env` file in the root directory with:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/tabibdz
   JWT_SECRET=your_secret_key_here
   NODE_ENV=development
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

## API Testing

### Authentication
1. Register a new user:
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
    "name": "Test User",
    "email": "test@example.com",
    "password": "123456",
    "role": "patient"
}
```

2. Login:
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
    "email": "test@example.com",
    "password": "123456"
}
```

### Doctor Endpoints
1. Create doctor profile (requires doctor role):
```http
POST http://localhost:5000/api/doctors
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
    "specialty": "General Medicine",
    "bio": "Experienced general practitioner",
    "city": "Algiers",
    "address": "123 Medical Center",
    "phone": "0555123456",
    "consultationFee": 2000,
    "languages": ["Arabic", "French"],
    "availableTimes": [
        {
            "day": "Monday",
            "startTime": "09:00",
            "endTime": "17:00"
        }
    ]
}
```

2. Get all doctors:
```http
GET http://localhost:5000/api/doctors
```

### Appointment Endpoints
1. Book appointment (requires patient role):
```http
POST http://localhost:5000/api/appointments
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
    "doctorId": "DOCTOR_ID",
    "date": "2024-02-20",
    "time": "10:00",
    "reason": "Regular checkup"
}
```

2. View patient appointments:
```http
GET http://localhost:5000/api/appointments/patient
Authorization: Bearer YOUR_TOKEN
```

## Testing Tools
You can use any of these tools to test the API:
- Postman (Recommended)
- Insomnia
- Thunder Client (VS Code extension)
- curl (Command line)

## Directory Structure
```
tabibdz/
├── config/
│   └── generateToken.js
├── controllers/
│   ├── authController.js
│   ├── doctorController.js
│   └── appointmentController.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── User.js
│   ├── Doctor.js
│   └── Appointment.js
├── routes/
│   ├── authRoutes.js
│   ├── doctorRoutes.js
│   └── appointmentRoutes.js
├── .env
├── package.json
└── server.js
``` 
=======
# TabibDz
>>>>>>> 2f6cc03ab24e787d72b164249ef476cac4b98728
