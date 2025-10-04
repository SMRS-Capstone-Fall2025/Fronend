import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudentPage from "./page/student/studentPage";
import RegisterProject from "./page/student/registerProject";
import MainScreen from "./page/student/mainScreen";
import Login from "./page/auth/login";
import Register from "./page/auth/register";
import InviteSupervisor from "./page/student/inviteSupervisors";
import AdminPage from "./page/admin/adminPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/studentpage" element={<StudentPage />} />
        <Route path="/registerproject" element={<RegisterProject />} />
        <Route path="/mainscreen" element={<MainScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/invitesupervisiors" element={<InviteSupervisor />} />
        <Route path="/adminpage" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}
