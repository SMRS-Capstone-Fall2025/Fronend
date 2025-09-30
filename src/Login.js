import React, { useState } from "react";
import "./Login.css";

function Login() {
  const [role, setRole] = useState("student");

  return (
    <div className="login-container">
      {/* Bên trái */}
      <div className="login-left">
        <h1>Welcome to SRMS</h1>
        <p>Scientific Research Management System</p>
      </div>

      {/* Bên phải */}
      <div className="login-right">
        <div className="login-box">
          {/* Logo */}
          <div className="logo">SRMS</div>
          <h2>Hệ thống Quản lý Đề tài Nghiên cứu Khoa học</h2>

          {/* Form */}
          <form>
            <div className="form-group">
              <label>Email / Mã số SV</label>
              <input type="text" placeholder="Nhập email hoặc mã số" />
            </div>

            <div className="form-group">
              <label>Mật khẩu</label>
              <input type="password" placeholder="Nhập mật khẩu" />
            </div>

            <div className="form-options">
              <label>
                <input type="checkbox" /> Ghi nhớ đăng nhập
              </label>
              <a href="#">Quên mật khẩu?</a>
            </div>

            <div className="form-group">
              <label>Vai trò</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Sinh viên</option>
                <option value="teacher">Giảng viên</option>
                <option value="admin">Quản trị</option>
              </select>
            </div>

            <button type="submit" className="btn-login">
              Đăng nhập
            </button>
          </form>

          <p className="no-account">
            Chưa có tài khoản? <a href="#">Liên hệ quản trị</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;