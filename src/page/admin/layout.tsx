import React from "react";
import HeaderAdmin from "../../component/headerAdmin";
import AdminMenu from "../../component/adminMenu";
import HeaderProjectManagement from "../../component/headerProjectManagement";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function AdminPage() {
  // Dữ liệu biểu đồ line (số lượng đề tài theo năm)
  const lineData = [
    { year: "2021", value: 120 },
    { year: "2022", value: 180 },
    { year: "2023", value: 260 },
    { year: "2024", value: 340 },
    { year: "2025", value: 420 },
  ];

  // Dữ liệu biểu đồ tròn (task overview)
  const pieData = [
    { name: "Completed", value: 316 },
    { name: "In Progress", value: 210 },
    { name: "Not Started", value: 100 },
  ];

  const COLORS = ["green", "blue", "yellow"];

  return (
    <div className="w-full flex h-screen bg-[#E8E8E8]">
      {/* Menu trái */}
      <div className="w-[20%] h-full">
        <AdminMenu />
      </div>

      {/* Nội dung bên phải */}
      <div className="w-[80%] mx-auto flex flex-col">
        <HeaderProjectManagement />

        <div className="w-[95%] mx-auto flex-1 rounded-2xl mt-5 p-6 bg-white">
          <h1 className="font-bold text-[25px] mb-6">Dashboard Overview</h1>

          {/* 4 ô thống kê */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white shadow-md rounded-xl p-4 text-center border">
              <h2 className="text-3xl font-bold">2,420</h2>
              <p className="text-gray-600">Project</p>
            </div>
            <div className="bg-white shadow-md rounded-xl p-4 text-center border">
              <h2 className="text-3xl font-bold">1,210</h2>
              <p className="text-gray-600">Task</p>
            </div>
            <div className="bg-white shadow-md rounded-xl p-4 text-center border">
              <h2 className="text-3xl font-bold">316</h2>
              <p className="text-gray-600">Message</p>
            </div>
            <div className="bg-white shadow-md rounded-xl p-4 text-center border">
              <h2 className="text-3xl font-bold">316</h2>
              <p className="text-gray-600">Progress</p>
            </div>
          </div>

          {/* Biểu đồ và bảng */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md border p-4">
              <h2 className="text-[18px] font-semibold mb-3">
                Number of Projects by Year
              </h2>
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-3 text-left border">#</th>
                    <th className="py-2 px-3 text-left border">Project</th>
                    <th className="py-2 px-3 text-left border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 px-3 border">1</td>
                    <td className="py-2 px-3 border">Virtual Reality - VR</td>
                    <td className="py-2 px-3 border text-blue-500 font-semibold">
                      In Progress
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border">2</td>
                    <td className="py-2 px-3 border">
                      Artificial Intelligence - AI
                    </td>
                    <td className="py-2 px-3 border text-gray-500 font-semibold">
                      Not Started
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border">3</td>
                    <td className="py-2 px-3 border">Cybersecurity - Broad</td>
                    <td className="py-2 px-3 border text-blue-500 font-semibold">
                      In Progress
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border">4</td>
                    <td className="py-2 px-3 border">AgriTech</td>
                    <td className="py-2 px-3 border text-green-500 font-semibold">
                      Complete
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Biểu đồ tròn */}
            <div className="bg-white rounded-xl shadow-md border p-4">
              <h2 className="text-[18px] font-semibold mb-3">Task Overview</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
