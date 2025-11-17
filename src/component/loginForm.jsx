import React, { useState } from "react";

function LoginForm() {
  const [role, setRole] = useState("student");

  return (
    <div className="login-box">
      <div className="logo">SRMS</div>
      <h2>Hệ thống Quản lý Đề tài Nghiên cứu Khoa học</h2>

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
            <option value="student">Student</option>
            <option value="teacher">Lecture</option>
            <option value="admin">Manage</option>
          </select>
        </div>

        <button type="submit" className="btn-login">
          Login
        </button>
      </form>

      <p className="no-account">
        Chưa có tài khoản? <a href="#">Liên hệ quản trị</a>
      </p>
    </div>
  );
}

export default LoginForm;
