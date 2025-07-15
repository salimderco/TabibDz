import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
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
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 