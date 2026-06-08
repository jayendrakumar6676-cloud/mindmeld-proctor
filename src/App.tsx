import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import LoginPage from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Exam from "@/pages/Exam";
import Coding from "@/pages/Coding";
import Submissions from "@/pages/Submissions";
import VoiceScreener from "@/pages/VoiceScreener";

export function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Voice screener sits between dashboard and exam */}
        <Route path="/screen/:examId" element={<VoiceScreener />} />
        <Route path="/exam/:examId" element={<Exam />} />
        <Route path="/coding/:examId" element={<Coding />} />
        <Route path="/submissions" element={<Submissions />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
