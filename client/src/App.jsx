import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import OfficerFarmerVerification from './pages/officer/OfficerFarmerVerification';
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute roles={['farmer']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/farmer" element={<FarmerDashboard />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['officer']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/officer" element={<OfficerFarmerVerification />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['buyer']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/buyer" element={<BuyerDashboard />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
