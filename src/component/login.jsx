import React from "react";
import LoginForm from "./LoginForm"; // import file mới
import "./Login.css";

function Login() {
  return (
    <div className="login-container">
      <div className="login-left">
        <h1>Welcome to SRMS</h1>
        <p>Scientific Research Management System</p>
      </div>

      <div className="login-right">
        <LoginForm /> {/* dùng component LoginForm */}
      </div>
    </div>
  );
}

export default Login;
