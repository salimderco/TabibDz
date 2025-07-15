import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doctorsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DoctorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [bookingStatus, setBookingStatus] = useState({ type: '', message: '' });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    visitDate: ''
  });

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const response = await doctorsAPI.getDoctorById(id);
        setDoctor(response.data);
        if (response.data.services?.length > 0) {
          setSelectedService(response.data.services[0].name);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch doctor profile. Please try again later.');
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, [id]);

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    try {
      const slots = await doctorsAPI.getAvailableSlots(id, date);
      setAvailableSlots(slots.data);
    } catch (err) {
      console.error('Failed to fetch available slots:', err);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: `/doctors/${id}` } });
      return;
    }

    setBookingStatus({ type: 'loading', message: 'Booking your appointment...' });
    try {
      await doctorsAPI.bookAppointment(id, {
        date: selectedDate,
        time: selectedTime,
        service: selectedService
      });
      setBookingStatus({
        type: 'success',
        message: 'Appointment booked successfully! Redirecting to dashboard...'
      });
      setTimeout(() => navigate('/dashboard/patient'), 2000);
    } catch (err) {
      setBookingStatus({
        type: 'error',
        message: 'Failed to book appointment. Please try again.'
      });
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await doctorsAPI.submitReview(id, reviewForm);
      const response = await doctorsAPI.getDoctorById(id);
      setDoctor(response.data);
      setReviewForm({ rating: 5, comment: '', visitDate: '' });
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    </div>
  );

  if (!doctor) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Doctor not found</h2>
        <button
          onClick={() => navigate('/doctors')}
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          Return to Doctors List
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
        >
          {/* Doctor Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-12 relative">
            <div className="flex items-center">
              <div className="h-24 w-24 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {doctor.user.name.charAt(0)}
                </span>
              </div>
              <div className="ml-6 text-white">
                <h1 className="text-3xl font-bold mb-2">{doctor.user.name}</h1>
                <p className="text-blue-100 text-lg">{doctor.specialty}</p>
                <div className="flex items-center mt-2">
                  <div className="flex items-center text-yellow-400">
                    {'★'.repeat(Math.floor(doctor.rating))}
                    {'☆'.repeat(5 - Math.floor(doctor.rating))}
                  </div>
                  <span className="ml-2 text-blue-100">({doctor.reviewsCount} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-8" aria-label="Tabs">
              {['overview', 'reviews', 'education', 'services'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Left Column - Doctor Information */}
            <div className="space-y-6">
              {activeTab === 'overview' && (
                <>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About</h2>
                    <p className="text-gray-600 dark:text-gray-300">{doctor.about}</p>
                  </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Professional Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Experience: {doctor.experience} years</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <span>Languages: {doctor.languages?.join(', ')}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{doctor.address}, {doctor.city}</span>
                  </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Insurance Accepted</h2>
                    <div className="space-y-2">
                      {doctor.insuranceAccepted?.map((insurance, index) => (
                        <div key={index} className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                          <span>{insurance.provider}</span>
                          <span className="text-sm text-gray-500">{insurance.planTypes.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'education' && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Education & Training</h2>
                  <div className="space-y-6">
                    {doctor.education?.map((edu, index) => (
                      <div key={index} className="border-l-2 border-blue-500 pl-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{edu.type}</h3>
                        <p className="text-gray-600 dark:text-gray-300">{edu.institution}</p>
                        <p className="text-gray-500 text-sm">{edu.field}</p>
                        <p className="text-gray-500 text-sm">{edu.startYear} - {edu.endYear || 'Present'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'services' && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Services Offered</h2>
                  <div className="space-y-4">
                    {doctor.services?.map((service, index) => (
                      <div key={index} className="border-b border-gray-200 dark:border-gray-600 last:border-0 pb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{service.description}</p>
                        <p className="text-blue-600 dark:text-blue-400 font-medium mt-2">{service.fee} DA</p>
                      </div>
                    ))}
                </div>
              </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {user && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Write a Review</h2>
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Rating
                          </label>
                          <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                className={`text-2xl ${
                                  star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Visit Date
                          </label>
                          <input
                            type="date"
                            value={reviewForm.visitDate}
                            onChange={(e) => setReviewForm({ ...reviewForm, visitDate: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Your Review
                          </label>
                          <textarea
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                            rows="4"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Submit Review
                        </button>
                      </form>
                    </div>
                  )}

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Patient Reviews</h2>
                    <div className="space-y-6">
                      {doctor.reviews?.map((review, index) => (
                        <div key={index} className="border-b border-gray-200 dark:border-gray-600 last:border-0 pb-6">
                          <div className="flex items-center mb-2">
                            <div className="flex text-yellow-400">
                              {'★'.repeat(review.rating)}
                              {'☆'.repeat(5 - review.rating)}
                            </div>
                            <span className="ml-2 text-gray-500 text-sm">
                              {new Date(review.visitDate).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
                </div>
              )}
            </div>

            {/* Right Column - Appointment Booking */}
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Book an Appointment</h2>
                {doctor.onlineConsultation?.available && (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <div className="flex items-center text-blue-700 dark:text-blue-300 mb-2">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">Online Consultation Available</span>
                    </div>
                    <p className="text-blue-600 dark:text-blue-400">
                      Video consultation fee: {doctor.onlineConsultation.fee} DA
                    </p>
                  </div>
                )}

              <form onSubmit={handleBookAppointment} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Service
                    </label>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      required
                    >
                      {doctor.services?.map((service, index) => (
                        <option key={index} value={service.name}>
                          {service.name} - {service.fee} DA
                        </option>
                      ))}
                    </select>
                  </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>

                  {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Available Time Slots
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((time, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            selectedTime === time
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-500'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                  </div>
                </div>
                  )}

                {bookingStatus.message && (
                    <div
                      className={`p-4 rounded-lg ${
                        bookingStatus.type === 'success'
                          ? 'bg-green-100 text-green-700'
                          : bookingStatus.type === 'error'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                    {bookingStatus.message}
                  </div>
                )}

                <button
                  type="submit"
                    disabled={!selectedDate || !selectedTime}
                    className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors duration-200 ${
                      selectedDate && selectedTime
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Book Appointment
                </button>
              </form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorProfilePage; 