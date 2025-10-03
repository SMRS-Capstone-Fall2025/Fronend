import React, { useState } from "react";

function Login() {
  const [role, setRole] = useState("student");

  return (
    <div className="flex h-screen font-sans">
      {/* Bên trái */}
      <div className="flex-1 bg-gray-100 flex flex-col justify-center items-center text-blue-600 p-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Welcome to SRMS</h1>
        <p className="text-lg">Scientific Research Management System</p>
      </div>

      {/* Bên phải */}
      <div className="flex-1 flex justify-center items-center bg-white">
        <div className="bg-gray-100 p-10 rounded-xl shadow-md w-96 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-3">SRMS</div>
          <h2 className="text-base mb-5 text-black">
            Hệ thống Quản lý Đề tài Nghiên cứu Khoa học
          </h2>

          <form className="space-y-4">
            {/* Email / Mã số */}
            <div className="text-left">
              <label className="block mb-1 font-medium">Email / Mã số SV</label>
              <input
                type="text"
                placeholder="Nhập email hoặc mã số"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Mật khẩu */}
            <div className="text-left">
              <label className="block mb-1 font-medium">Mật khẩu</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Options */}
            <div className="flex justify-between text-sm">
              <label>
                <input type="checkbox" className="mr-1" /> Ghi nhớ đăng nhập
              </label>
              <a href="#" className="text-blue-600 hover:underline">
                Quên mật khẩu?
              </a>
            </div>

            {/* Role */}
            <div className="text-left">
              <label className="block mb-1 font-medium">Vai trò</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="student">Student</option>
                <option value="teacher">Lecture</option>
                <option value="admin">Manage</option>
              </select>
            </div>

            {/* Button login */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </form>

          {/* Footer */}
          <p className="mt-4 text-sm">
            Chưa có tài khoản?{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Liên hệ quản trị
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
