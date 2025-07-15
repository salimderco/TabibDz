import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const DoctorProfileSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    specialty: '',
    bio: '',
    city: '',
    address: '',
    phone: '',
    consultationFee: '',
    languages: [],
    availableTimes: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00' }
    ]
  });

  const cities = ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Setif', 'Batna', 'Other'];
  const languageOptions = ['Arabic', 'French', 'English'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLanguageChange = (language) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handleTimeSlotChange = (index, field, value) => {
    const newTimes = [...formData.availableTimes];
    newTimes[index] = { ...newTimes[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      availableTimes: newTimes
    }));
  };

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      availableTimes: [...prev.availableTimes, { day: 'Monday', startTime: '09:00', endTime: '17:00' }]
    }));
  };

  const removeTimeSlot = (index) => {
    if (formData.availableTimes.length > 1) {
      setFormData(prev => ({
        ...prev,
        availableTimes: prev.availableTimes.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.specialty || !formData.bio || !formData.city || !formData.address || 
          !formData.phone || !formData.consultationFee || formData.languages.length === 0) {
        throw new Error('Please fill in all required fields');
      }

      // Validate phone number format (Algerian)
      const phoneRegex = /^(\+213|0)(5|6|7)[0-9]{8}$/;
      if (!phoneRegex.test(formData.phone)) {
        throw new Error('Please enter a valid Algerian phone number');
      }

      // Convert consultation fee to number
      const dataToSend = {
        ...formData,
        consultationFee: Number(formData.consultationFee)
      };

      console.log('Sending doctor profile data:', dataToSend);
      const response = await api.post('/api/doctors', dataToSend);
      console.log('Server response:', response.data);

      toast.success('Profile created successfully!');
      navigate('/dashboard/doctor');
    } catch (error) {
      console.error('Error creating doctor profile:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold mb-6">Complete Your Doctor Profile</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Specialty */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Specialty</label>
              <input
                type="text"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select a city</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g., 0555123456"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <p className="mt-1 text-sm text-gray-500">Format: 05/06/07 followed by 8 digits</p>
            </div>

            {/* Consultation Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Consultation Fee (DZD)</label>
              <input
                type="number"
                name="consultationFee"
                value={formData.consultationFee}
                onChange={handleChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
              <div className="space-x-4">
                {languageOptions.map(language => (
                  <label key={language} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.languages.includes(language)}
                      onChange={() => handleLanguageChange(language)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">{language}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Available Times */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Times</label>
              {formData.availableTimes.map((slot, index) => (
                <div key={index} className="flex gap-4 mb-4">
                  <select
                    value={slot.day}
                    onChange={(e) => handleTimeSlotChange(index, 'day', e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => handleTimeSlotChange(index, 'startTime', e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => handleTimeSlotChange(index, 'endTime', e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTimeSlot}
                className="text-blue-600 hover:text-blue-800"
              >
                + Add Time Slot
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Creating Profile...' : 'Create Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileSetup; 