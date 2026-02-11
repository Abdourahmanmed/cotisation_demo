import { Routes, Route } from "react-router-dom";
import Shell from "./components/Shell";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import OtpVerify from "./pages/OtpVerify";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp" element={<OtpVerify />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/client"
          element={
            <ProtectedRoute role="CLIENT">
              <ClientDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Shell>
  );
}
