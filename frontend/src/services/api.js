import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  verifyToken: () => api.get('/auth/verify'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword })
};

export const doctorsAPI = {
  getAllDoctors: () => api.get('/doctors'),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  searchDoctors: (filters) => api.get('/doctors/search', { params: filters }),
  getAvailableSlots: (doctorId, date) => api.get(`/doctors/${doctorId}/slots`, { params: { date } }),
  bookAppointment: (doctorId, appointmentData) => api.post(`/doctors/${doctorId}/appointments`, appointmentData),
  submitReview: (doctorId, reviewData) => api.post(`/doctors/${doctorId}/reviews`, reviewData),
  updateDoctorProfile: (doctorId, profileData) => api.put(`/doctors/${doctorId}`, profileData),
  getDoctorAppointments: (doctorId) => api.get(`/doctors/${doctorId}/appointments`),
  updateAppointmentStatus: (doctorId, appointmentId, status) => 
    api.put(`/doctors/${doctorId}/appointments/${appointmentId}`, { status }),
  getDoctorReviews: (doctorId) => api.get(`/doctors/${doctorId}/reviews`),
  updateAvailability: (doctorId, availabilityData) => 
    api.put(`/doctors/${doctorId}/availability`, availabilityData),
  addService: (doctorId, serviceData) => api.post(`/doctors/${doctorId}/services`, serviceData),
  updateService: (doctorId, serviceId, serviceData) => 
    api.put(`/doctors/${doctorId}/services/${serviceId}`, serviceData),
  deleteService: (doctorId, serviceId) => api.delete(`/doctors/${doctorId}/services/${serviceId}`),
  updateOnlineConsultation: (doctorId, consultationData) => 
    api.put(`/doctors/${doctorId}/online-consultation`, consultationData)
};

export const appointmentsAPI = {
  getPatientAppointments: () => api.get('/appointments/patient'),
  getDoctorAppointments: () => api.get('/appointments/doctor'),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  createAppointment: (appointmentData) => api.post('/appointments', appointmentData),
  updateAppointment: (id, appointmentData) => api.put(`/appointments/${id}`, appointmentData),
  cancelAppointment: (id) => api.delete(`/appointments/${id}`),
  getUpcomingAppointments: () => api.get('/appointments/upcoming'),
  getPastAppointments: () => api.get('/appointments/past'),
  rescheduleAppointment: (id, newDateTime) => 
    api.put(`/appointments/${id}/reschedule`, { newDateTime }),
  confirmAppointment: (id) => api.put(`/appointments/${id}/confirm`),
  completeAppointment: (id) => api.put(`/appointments/${id}/complete`),
  addAppointmentNotes: (id, notes) => api.post(`/appointments/${id}/notes`, { notes }),
  getAppointmentHistory: (patientId) => api.get(`/appointments/history/${patientId}`)
};

export const userAPI = {
  updateProfile: (userData) => api.put('/users/profile', userData),
  getProfile: () => api.get('/users/profile'),
  updatePassword: (passwordData) => api.put('/users/password', passwordData),
  uploadProfilePicture: (formData) => api.post('/users/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAccount: () => api.delete('/users/account'),
  getNotificationPreferences: () => api.get('/users/notifications/preferences'),
  updateNotificationPreferences: (preferences) => 
    api.put('/users/notifications/preferences', preferences),
  getNotifications: () => api.get('/users/notifications'),
  markNotificationAsRead: (notificationId) => 
    api.put(`/users/notifications/${notificationId}/read`),
  clearAllNotifications: () => api.delete('/users/notifications')
};

export const insuranceAPI = {
  verifyInsurance: (insuranceData) => api.post('/insurance/verify', insuranceData),
  getInsuranceProviders: () => api.get('/insurance/providers'),
  getInsurancePlans: (providerId) => api.get(`/insurance/providers/${providerId}/plans`),
  submitInsuranceClaim: (claimData) => api.post('/insurance/claims', claimData),
  getClaimStatus: (claimId) => api.get(`/insurance/claims/${claimId}`),
  getInsuranceCoverage: (insuranceId) => api.get(`/insurance/${insuranceId}/coverage`)
};

export default api; 