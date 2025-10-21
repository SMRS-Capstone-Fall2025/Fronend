import React from "react";
import HeaderAdmin from "../../component/headerAdmin";
import AdminMenu from "../../component/adminMenu";
import HeaderStatisticsReports from "../../component/headerStatisticsReports";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminPage() {
  // Dữ liệu mẫu cho biểu đồ
  const data = [
    { month: "Jan", subscribers: 200 },
    { month: "Feb", subscribers: 400 },
    { month: "Mar", subscribers: 600 },
    { month: "Apr", subscribers: 800 },
    { month: "May", subscribers: 1000 },
    { month: "Jun", subscribers: 1200 },
    { month: "Jul", subscribers: 1300 },
    { month: "Aug", subscribers: 1100 },
  ];

  return (
    <div className="w-full flex h-screen bg-[#E8E8E8]">
      {/* menu bên trái */}
      <div className="w-[20%] h-full">
        <AdminMenu />
      </div>

      {/* nội dung bên phải */}
      <div className="w-[80%] mx-auto flex flex-col">
        <HeaderStatisticsReports />

        {/* phần thống kê */}
        <div className="w-[95%] mx-auto flex-1 rounded-2xl mt-5 p-6 bg-white shadow-md">
          <h1 className="font-bold text-[25px] mb-6">Dashboard Overview</h1>

          {/* 4 ô số liệu */}
          <div className="grid grid-cols-4 gap-6 mb-10">
            <div className="p-5 bg-gray-50 rounded-xl shadow text-center">
              <h2 className="text-2xl font-bold text-[blue]">2,420</h2>
              <p className="text-gray-600">Project</p>
            </div>
            <div className="p-5 bg-gray-50 rounded-xl shadow text-center">
              <h2 className="text-2xl font-bold text-[green]">1,210</h2>
              <p className="text-gray-600">Task</p>
            </div>
            <div className="p-5 bg-gray-50 rounded-xl shadow text-center">
              <h2 className="text-2xl font-bold text-[yellow]">316</h2>
              <p className="text-gray-600">Message</p>
            </div>
            <div className="p-5 bg-gray-50 rounded-xl shadow text-center">
              <h2 className="text-2xl font-bold text-[red]">316</h2>
              <p className="text-gray-600">Progress</p>
            </div>
          </div>

          {/* biểu đồ */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Subscribers</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="subscribers" fill="blue" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
