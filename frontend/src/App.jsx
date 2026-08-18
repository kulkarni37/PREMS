import { ThemeProvider } from "./context/ThemeContext.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/public/HomePage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import ForgotPasswordPage from "./pages/public/ForgotPasswordPage";
import OtpVerificationPage from "./pages/public/OtpVerificationPage";
import ResetPasswordPage from "./pages/public/ResetPasswordPage";
import OrganizationRegisterPage from "./pages/public/OrganizationRegisterPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import GuideDashboard from "./pages/guide/GuideDashboard";
import CoordinatorDashboard from "./pages/coordinator/CoordinatorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/organization/register" element={<OrganizationRegisterPage />} />
          <Route path="/institution-register" element={<OrganizationRegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/otp-verification" element={<OtpVerificationPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Student Portal Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student" element={<StudentDashboard />} />

          {/* Guide Portal Routes */}
          <Route path="/guide/dashboard" element={<GuideDashboard />} />
          <Route path="/guide" element={<GuideDashboard />} />

          {/* Coordinator Portal Routes */}
          <Route path="/coordinator/dashboard" element={<CoordinatorDashboard />} />
          <Route path="/coordinator" element={<CoordinatorDashboard />} />

          {/* Admin Portal Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}