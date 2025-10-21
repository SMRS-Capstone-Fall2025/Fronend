import React from "react";
import HeaderAdmin from "../../component/headerAdmin";
import AdminMenu from "../../component/adminMenu";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminPage() {
  // Dữ liệu biểu đồ
  const data = [
    { year: "2021", value: 400 },
    { year: "2022", value: 700 },
    { year: "2023", value: 850 },
    { year: "2024", value: 950 },
    { year: "2025", value: 1200 },
  ];

  // Dữ liệu bảng
  const projects = [
    { id: 1, name: "Virtual Reality - VR", date: "May 9, 2025" },
    { id: 2, name: "Artificial Intelligence - AI", date: "April 28, 2025" },
    { id: 3, name: "Cybersecurity - Broad", date: "February 11, 2024" },
    { id: 4, name: "AgriTech", date: "March 23, 2013" },
  ];

  return (
    <div className="w-full flex h-screen bg-[#E8E8E8]">
      {/* menuleft */}
      <div className="w-[20%] h-full">
        <AdminMenu />
      </div>

      {/* right content */}
      <div className="w-[80%] mx-auto flex flex-col">
        {/* Header */}
        <HeaderAdmin />

        {/* Nội dung chính */}
        <div className="w-[95%] mx-auto flex-1 rounded-2xl mt-[20px] p-6 bg-white">
          <h1 className="font-bold text-[25px] mb-6">Dashboard Overview</h1>

          {/* 4 ô thống kê */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-50 shadow-md rounded-xl p-4 text-center">
              <h2 className="text-[28px] font-bold text-gray-800">2,420</h2>
              <p className="text-gray-500 text-sm">Total Projects</p>
            </div>

            <div className="bg-gray-50 shadow-md rounded-xl p-4 text-center">
              <h2 className="text-[28px] font-bold text-gray-800">1,210</h2>
              <p className="text-gray-500 text-sm">Projects in Progress</p>
            </div>

            <div className="bg-gray-50 shadow-md rounded-xl p-4 text-center">
              <h2 className="text-[28px] font-bold text-gray-800">316</h2>
              <p className="text-gray-500 text-sm">Completed Projects</p>
            </div>

            <div className="bg-gray-50 shadow-md rounded-xl p-4 text-center">
              <h2 className="text-[28px] font-bold text-gray-800">316</h2>
              <p className="text-gray-500 text-sm">Pending Approval</p>
            </div>
          </div>

          {/* Biểu đồ + Bảng */}
          <div className="grid grid-cols-2 gap-6">
            {/* Biểu đồ */}
            <div className="bg-gray-50 shadow-md rounded-xl p-4">
              <h2 className="font-semibold mb-4">Number of Projects by Year</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="green"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bảng dữ liệu */}
            <div className="bg-gray-50 shadow-md rounded-xl p-4">
              <h2 className="font-semibold mb-4">Number of Projects by Year</h2>
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-3 text-gray-600 font-medium">STT</th>
                    <th className="py-2 px-3 text-gray-600 font-medium">
                      Project
                    </th>
                    <th className="py-2 px-3 text-gray-600 font-medium">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p, index) => (
                    <tr key={p.id} className="border-b hover:bg-gray-100">
                      <td className="py-2 px-3">{index + 1}</td>
                      <td className="py-2 px-3">{p.name}</td>
                      <td className="py-2 px-3">{p.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
