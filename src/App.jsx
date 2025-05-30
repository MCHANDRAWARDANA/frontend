import "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import RegistrasiPetugas from "./components/menu/Registrasi";
import StockManagement from "./components/menu/StockManagement";
import DataManagement from "./components/menu/DataManagement";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/StaffDashboard" element={<StaffDashboard />} />
        <Route path="/RegistrasiPetugas" element={<RegistrasiPetugas />} />
        <Route path="/StockManagement" element={<StockManagement />} />
        <Route path="/DataManagement" element={<DataManagement />} />
      </Routes>
    </Router>
  );
};

export default App;
