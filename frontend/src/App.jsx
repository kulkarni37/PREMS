import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import StartupScreen from "./components/StartupScreen.jsx";

import HomePage from "./pages/public/HomePage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import ForgotPasswordPage from "./pages/public/ForgotPasswordPage";
import OtpVerificationPage from "./pages/public/OtpVerificationPage";
import ResetPasswordPage from "./pages/public/ResetPasswordPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import GuideDashboard from "./pages/guide/GuideDashboard";
import CoordinatorDashboard from "./pages/coordinator/CoordinatorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  return (
    <ThemeProvider>
      <AnimatePresence mode="wait">
        {isInitializing && (
          <StartupScreen key="prmes-startup-screen" onComplete={() => setIsInitializing(false)} />
        )}
      </AnimatePresence>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/organization/register" element={<Navigate to="/login" replace />} />
          <Route path="/institution-register" element={<Navigate to="/login" replace />} />
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