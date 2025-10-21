import React from "react";
import { FaUserPlus, FaUsers } from "react-icons/fa";
import AdminMenu from "../../component/adminMenu";
import HeaderAdmin from "../../component/headerAdmin";
import HeaderUserManagement from "../../component/headerUserManagement";

export default function AdminPage() {
  const data = [
    {
      id: 1,
      avatar: "SRMS",
      name: "SRMS",
      email: "SRMSA@gmail.com",
      role: "Admin",
      status: "Active",
    },
    {
      id: 2,
      avatar: "SMS",
      name: "SMS",
      email: "SMS@gmail.com",
      role: "User",
      status: "Active",
    },
    {
      id: 3,
      avatar: "CSS",
      name: "CSS",
      email: "CSS@gmail.com",
      role: "User",
      status: "In Active",
    },
    {
      id: 4,
      avatar: "GSG",
      name: "GSG",
      email: "GSG@gmail.com",
      role: "Lecture",
      status: "Active",
    },
  ];

  return (
    <div className="w-full flex h-screen bg-[#E8E8E8]">
      {/* menu trái */}
      <div className="w-[20%] h-full">
        <AdminMenu />
      </div>

      {/* nội dung phải */}
      <div className="w-[80%] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-700 font-semibold text-lg">
            <FaUserPlus className="text-blue-500" />
            Add User
          </div>
          <div className="flex items-center gap-2 text-gray-700 font-semibold text-lg">
            <FaUsers className="text-blue-500" />
            User Management
          </div>
        </div>

        {/* nội dung chính */}
        <div className="w-[95%] mx-auto flex-1 rounded-2xl mt-5 p-6 bg-white shadow-md">
          <h1 className="font-bold text-[25px] mb-6">Dashboard Overview</h1>

          {/* Thống kê tổng quan */}
          <div className="grid grid-cols-4 gap-6 mb-10">
            <div className="p-5 bg-gray-50 rounded-xl shadow text-center">
              <h2 className="text-2xl font-bold text-[blue]">2,420</h2>
              <p className="text-gray-600">Total</p>
            </div>
            <div className="p-5 bg-gray-50 rounded-xl shadow text-center">
              <h2 className="text-2xl font-bold text-[green]">1,210</h2>
              <p className="text-gray-600">In Progress</p>
            </div>
            <div className="p-5 bg-gray-50 rounded-xl shadow text-center">
              <h2 className="text-2xl font-bold text-[yellow]">316</h2>
              <p className="text-gray-600">Completed</p>
            </div>
            <div className="p-5 bg-gray-50 rounded-xl shadow text-center">
              <h2 className="text-2xl font-bold text-[red]">316</h2>
              <p className="text-gray-600">Pending</p>
            </div>
          </div>

          {/* Bảng dữ liệu */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Projects by Year</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">
                      Avatar
                    </th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">
                      Name
                    </th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">
                      Email
                    </th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">
                      Role
                    </th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">
                      Status
                    </th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{item.avatar}</td>
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4">{item.email}</td>
                      <td className="py-3 px-4">{item.role}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            item.status === "Active"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-blue-500 hover:underline cursor-pointer">
                        Edit
                      </td>
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
