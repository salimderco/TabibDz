import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkProfileAndFetchData = async () => {
      try {
        // First check if doctor profile exists
        await api.get('/api/doctors/profile');
        
        // If profile exists, fetch appointments
        const response = await api.get('/api/appointments/doctor');
        setAppointments(response.data);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 404) {
          // Profile doesn't exist, redirect to profile setup
          navigate('/doctor/profile-setup');
        } else {
          setError('Failed to fetch appointments. Please try again later.');
          setLoading(false);
        }
      }
    };

    checkProfileAndFetchData();
  }, [navigate]);

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      await api.patch(`/api/appointments/${appointmentId}`, { status });
      setAppointments(appointments.map(app => 
        app._id === appointmentId ? { ...app, status } : app
      ));
    } catch (err) {
      alert('Failed to update appointment status. Please try again.');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome, Dr. {user?.name}!</h1>
          <p className="text-gray-600">Manage your appointments and schedule</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Your Appointments</h2>
          {appointments.length === 0 ? (
            <p className="text-center text-gray-500">No appointments scheduled.</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Patient: {appointment.patient.name}</h3>
                      <p className="text-gray-600">
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </p>
                      <p className="text-gray-600">Status: {appointment.status}</p>
                    </div>
                    <div className="flex gap-2">
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(appointment._id, 'confirmed')}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(appointment._id, 'cancelled')}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(appointment._id, 'completed')}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard; 