import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Star, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

const specialties = [
  'General Practice',
  'Dentistry',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
];

const features = [
  {
    icon: Calendar,
    title: 'Easy Scheduling',
    description: 'Book appointments online 24/7, hassle-free and instant confirmation.',
  },
  {
    icon: Star,
    title: 'Verified Reviews',
    description: 'Read genuine patient reviews and ratings to make informed decisions.',
  },
  {
    icon: MapPin,
    title: 'Location-Based Search',
    description: 'Find doctors near you with our smart location-based search.',
  },
];

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${searchQuery}&location=${location}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
              Find and Book the Best Doctors
              <span className="block text-primary-600">in Algeria</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-300">
              Book appointments with the best doctors and specialists in your area
            </p>
          </div>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="mt-12 max-w-3xl mx-auto flex flex-col sm:flex-row gap-4"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search doctors, specialties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <Button type="submit" size="lg" className="sm:w-auto">
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* Popular Specialties */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Popular Specialties
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {specialties.map((specialty) => (
              <Card
                key={specialty}
                className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => navigate(`/search?specialty=${specialty}`)}
              >
                <CardContent className="p-6 text-center">
                  <h3 className="font-medium text-gray-900 dark:text-white">{specialty}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Why Choose TabibDZ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 mx-auto mb-4 bg-primary-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary-600 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Find Your Doctor?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of patients who book appointments through TabibDZ
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/register')}
            className="group"
          >
            Get Started
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>
    </div>
  );
} 