import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.get('/api/appointments/patient');
        setAppointments(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch appointments. Please try again later.');
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await api.delete(`/api/appointments/${appointmentId}`);
      setAppointments(appointments.filter(app => app._id !== appointmentId));
    } catch (err) {
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name}!</h1>
          <p className="text-gray-600">Here's an overview of your appointments</p>
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
                      <h3 className="font-medium">Dr. {appointment.doctor.name}</h3>
                      <p className="text-gray-600">{appointment.doctor.specialty}</p>
                      <p className="text-gray-600">
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCancelAppointment(appointment._id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      Cancel
                    </button>
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

export default PatientDashboard; 