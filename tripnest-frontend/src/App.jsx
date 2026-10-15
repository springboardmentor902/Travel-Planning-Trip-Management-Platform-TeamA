import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import LandingPage    from './pages/LandingPage';
import Login          from './pages/Login';
import Register       from './pages/Register';
import Dashboard      from './pages/Dashboard';
import OAuth2Success  from './pages/OAuth2Success';
import Trips          from './pages/Trips';
import CreateTrip     from './pages/CreateTrip';
import TripDetail     from './pages/TripDetail';
import Destinations   from './pages/Destinations';
import Budget         from './pages/Budget';
import Expenses       from './pages/Expenses';
import Groups         from './pages/Groups';
import Notifications  from './pages/Notifications';
import Documents from './pages/Documents';
import Analytics from './pages/Analytics';
import AdminDashboard from './pages/AdminDashboard';
import TripReport     from './pages/TripReport';
import Settlement  from './pages/Settlement';
import TripExpenses from './pages/TripExpenses';
import Profile from './pages/Profile';


const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  if (!user && !token) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
    const { user } = useAuth();
    const token = localStorage.getItem('user');
    const storedUser = token ? JSON.parse(token) : null;
    const role = user?.role || storedUser?.role;

    if (role !== 'ADMIN') {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/"               element={<LandingPage />} />
    <Route path="/login"          element={<Login />} />
    <Route path="/register"       element={<Register />} />
    <Route path="/oauth2/success" element={<OAuth2Success />} />

    <Route path="/dashboard" element={
      <PrivateRoute><Dashboard /></PrivateRoute>} />
    <Route path="/trips" element={
      <PrivateRoute><Trips /></PrivateRoute>} />
    <Route path="/trips/create" element={
      <PrivateRoute><CreateTrip /></PrivateRoute>} />
    <Route path="/trips/:id" element={
      <PrivateRoute><TripDetail /></PrivateRoute>} />
    <Route path="/destinations" element={
      <PrivateRoute><Destinations /></PrivateRoute>} />

    {/* ✅ Milestone 3 Routes */}
    <Route path="/trips/:tripId/budget" element={
      <PrivateRoute><Budget /></PrivateRoute>} />
    <Route path="/trips/:tripId/expenses" element={
      <PrivateRoute><Expenses /></PrivateRoute>} />
    <Route path="/groups" element={
      <PrivateRoute><Groups /></PrivateRoute>} />
    <Route path="/notifications" element={
      <PrivateRoute><Notifications /></PrivateRoute>} />
    <Route path="/analytics" element={
    <PrivateRoute><Analytics /></PrivateRoute>} />  
    <Route path="/trips/:id/documents" element={
    <PrivateRoute><Documents /></PrivateRoute>} />  
    <Route path="/admin" element={
    <AdminRoute><AdminDashboard /></AdminRoute>} />
    <Route path="/reports/trips/:id" element={
    <PrivateRoute><TripReport /></PrivateRoute>} />
    <Route path="/trips/:id/settlement" element={
    <PrivateRoute><Settlement /></PrivateRoute>} />
    <Route path="/trips/:id/expenses" element={
    <PrivateRoute><TripExpenses /></PrivateRoute>} />
    <Route path="/profile" element={
    <PrivateRoute><Profile /></PrivateRoute>} />

  </Routes>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;