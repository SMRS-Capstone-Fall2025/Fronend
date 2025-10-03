import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudentPage from "./page/student/studentPage";
import RegisterProject from "./page/student/registerProject";
import MainScreen from "./page/student/mainScreen";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/studentpage" element={<StudentPage />} />
        <Route path="/registerproject" element={<RegisterProject/>} />
        <Route path="/mainscreen" element={<MainScreen/>} />
      </Routes>
    </Router>
  );
}
