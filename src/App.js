import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudentPage from "./page/student/studentPage";
import RegisterProject from "./page/student/registerProject";
import MainScreen from "./page/student/mainScreen";
import Login from "./page/auth/login";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/studentpage" element={<StudentPage />} />
        <Route path="/registerproject" element={<RegisterProject/>} />
        <Route path="/login" element={<Login/>} />
      </Routes>
    </Router>
  );
}
