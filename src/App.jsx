import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import StudentDashboard from "./pages/student/StudentDashboard";
import AdminDashboard from "./pages/student/AdminDashboard";
import PayFee from "./pages/student/PayFee";
import ParentDashboard from "./pages/parent/ParentDashBoard";
import Receipt from "./pages/Receipt";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/student/pay/:feeId" element={<PayFee />} />
        <Route path="/receipt/:paymentId" element={<Receipt />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
