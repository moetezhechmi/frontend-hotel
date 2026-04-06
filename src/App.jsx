import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ClientHome from './components/ClientHome';
import AdminLogin from './components/AdminLogin';
import { registerSW } from 'virtual:pwa-register';

// Register service worker with auto-update
registerSW({ immediate: true });

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/client" replace />} />
        <Route path="/client" element={<Login />} />
        <Route path="/client/services" element={<ClientHome />} />
        <Route path="/dashboard/login" element={<AdminLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
