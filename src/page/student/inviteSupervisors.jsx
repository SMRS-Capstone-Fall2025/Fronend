import React, { useState } from "react";
import StudentMenu from "../../component/studentMenu";
import HeaderStudent from "../../component/headerStudent";

export default function InviteSupervisors() {
  const [search, setSearch] = useState("");

  const data = [
    { id: 1, name: "Le Van A", email: "aLV1111@edu.vn" },
    { id: 2, name: "Le Van B", email: "bLV1111@edu.vn" },
    { id: 3, name: "Nguyen Thi C", email: "cNT1111@edu.vn" },
    { id: 4, name: "Nguyen Thi D", email: "dNT1111@edu.vn" },
  ];

  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full flex h-full bg-[#E8E8E8]">
      <div className="w-[20%] h-full">
        <StudentMenu />
      </div>

      <div className="w-[80%] mx-auto flex flex-col">
        <HeaderStudent />

        <div className="w-[95%] mx-auto flex-1 rounded-2xl mt-[20px] p-6 bg-white">
          {/* title */}
          <div className="flex justify-center">
            <h1 className="text-xl font-bold mb-6">
              The List of Supervisor in this semester
            </h1>
          </div>

          {/* Search */}
          <div className="p-4 w-full flex flex-col items-start">
            <div className="flex items-center mb-6 space-x-2">
              <label className="text-sm font-medium">Email or Name:</label>
              <input
                type="text"
                placeholder="Email or Name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded-md px-3 py-1 outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button className="px-4 py-1 rounded-md bg-purple-400 text-white font-semibold hover:bg-purple-500">
                Search
              </button>
            </div>
          </div>

          <table className=" w-full border-collapse border border-red-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">
                  No.
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Group
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Description
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    {idx + 1}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.email}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 flex justify-center">
                    <button className="px-4 py-1 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 ">
                      Invite
                    </button>
                    <button className="bg-yellow-500 ml-2 text-white px-3 py-1 rounded-md hover:bg-yellow-600 ">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-center items-center space-x-3 mt-6">
            <button className="px-4 py-2 rounded-full bg-purple-300 text-purple-700 font-semibold hover:bg-purple-400">
              First
            </button>
            <button className="px-4 py-2 rounded-full bg-purple-300 text-purple-700 font-semibold hover:bg-purple-400">
              1
            </button>
            <button className="px-4 py-2 rounded-full bg-purple-300 text-purple-700 font-semibold hover:bg-purple-400">
              2
            </button>
            <button className="px-4 py-2 rounded-full bg-purple-300 text-purple-700 font-semibold hover:bg-purple-400">
              3
            </button>
            <button className="px-4 py-2 rounded-full bg-purple-300 text-purple-700 font-semibold hover:bg-purple-400">
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
