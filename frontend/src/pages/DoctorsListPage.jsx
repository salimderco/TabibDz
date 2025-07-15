import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doctorsAPI } from '../services/api';
import { Search, MapPin, Filter, Star, Clock, Calendar } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

const DoctorsListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    specialty: searchParams.get('specialty') || '',
    location: searchParams.get('location') || '',
    insurance: searchParams.get('insurance') || '',
    availability: searchParams.get('availability') || '',
    rating: searchParams.get('rating') || '',
    language: searchParams.get('language') || ''
  });

  const specialties = [
    'Cardiology',
    'Dermatology',
    'Family Medicine',
    'Gynecology',
    'Internal Medicine',
    'Neurology',
    'Ophthalmology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry'
  ];

  const languages = ['Arabic', 'English', 'French'];
  const insuranceProviders = ['CNAS', 'CASNOS', 'Military Insurance', 'Private Insurance'];

  useEffect(() => {
    fetchDoctors();
  }, [activeFilters]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorsAPI.searchDoctors(activeFilters);
      setDoctors(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch doctors. Please try again later.');
      setLoading(false);
    }
  };

  const handleFilterChange = (category, value) => {
    setActiveFilters(prev => {
      const newFilters = {
        ...prev,
        [category]: prev[category] === value ? '' : value,
      };
      
      // Update URL params
      const params = new URLSearchParams(searchParams);
      Object.entries(newFilters).forEach(([key, val]) => {
        if (val) {
          params.set(key, val);
        } else {
          params.delete(key);
        }
      });
      setSearchParams(params);
      
      return newFilters;
    });
  };

  const DoctorCard = ({ doctor }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="p-6">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600">{doctor.user.name.charAt(0)}</span>
          </div>
          <div className="ml-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{doctor.user.name}</h3>
            <p className="text-blue-600 dark:text-blue-400">{doctor.specialty}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-yellow-400">
            {'★'.repeat(doctor.rating)} {'☆'.repeat(5 - doctor.rating)}
            <span className="ml-2 text-gray-600 dark:text-gray-300">({doctor.reviewsCount} reviews)</span>
          </div>
          
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {doctor.address}, {doctor.city}
          </div>

          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {doctor.consultationFee} DA
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {doctor.insuranceAccepted?.map((insurance, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                {insurance}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => navigate(`/doctors/${doctor._id}`)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Search Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search doctors, specialties..."
                value={searchParams.get('q') || ''}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams);
                  params.set('q', e.target.value);
                  setSearchParams(params);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Location"
                value={searchParams.get('location') || ''}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams);
                  params.set('location', e.target.value);
                  setSearchParams(params);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
                <Filter size={20} className="text-gray-500" />
              </div>

              {Object.entries(activeFilters).map(([category, options]) => (
                <div key={category} className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white capitalize mb-3">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleFilterChange(category.toLowerCase(), option)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                          activeFilters[category.toLowerCase()] === option
                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-100'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading doctors...</p>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error! </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            ) : (
              <div className="space-y-4">
                {doctors.map((doctor) => (
                  <Card key={doctor._id} className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-32 h-32 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                          {/* Doctor Image */}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Dr. {doctor.user.name}
                              </h3>
                              <p className="text-primary-600 dark:text-primary-400">{doctor.specialty}</p>
                            </div>
                            <div className="flex items-center">
                              <Star className="w-5 h-5 text-yellow-400 fill-current" />
                              <span className="ml-1 text-gray-700 dark:text-gray-300">
                                {doctor.rating?.average || 'New'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <MapPin size={16} className="mr-2" />
                              <span>{doctor.address}, {doctor.city}</span>
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <Clock size={16} className="mr-2" />
                              <span>Next available: Today</span>
                            </div>
                          </div>

                          <div className="mt-6 flex items-center justify-between">
                            <div className="text-gray-600 dark:text-gray-400">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {doctor.consultationFee} DA
                              </span>
                              {' '}per visit
                            </div>
                            <Button
                              onClick={() => navigate(`/doctors/${doctor._id}`)}
                              className="flex items-center"
                            >
                              <Calendar size={16} className="mr-2" />
                              Book Appointment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {doctors.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400">
                      No doctors found matching your criteria.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorsListPage;