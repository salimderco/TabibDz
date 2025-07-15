import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DoctorsListPage from './pages/DoctorsListPage';
import DoctorProfilePage from './pages/DoctorProfilePage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorProfileSetup from './pages/DoctorProfileSetup';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <div className="pt-16">
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/doctors" element={<DoctorsListPage />} />
                <Route path="/doctors/:id" element={<DoctorProfilePage />} />
                <Route
                  path="/dashboard/patient"
                  element={
                    <PrivateRoute requiredRole="patient">
                      <PatientDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/dashboard/doctor"
                  element={
                    <PrivateRoute requiredRole="doctor">
                      <DoctorDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/doctor/profile-setup"
                  element={
                    <PrivateRoute requiredRole="doctor">
                      <DoctorProfileSetup />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </div>
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            className: 'toast',
            duration: 5000,
            success: {
              className: 'toast toast-success',
              iconTheme: {
                primary: '#10B981',
                secondary: '#FFFFFF',
              },
            },
            error: {
              className: 'toast toast-error',
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
