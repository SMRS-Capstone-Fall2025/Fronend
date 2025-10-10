import React, { useState } from "react";
import ResearchManagementOfficeMenu from "../../component/researchManagementOfficeMenu";
import HeaderResearchManagementOffice from "../../component/headerResearchManagementOffice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

export default function ResearchManagementOffice() {
  const [profession, setProfession] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [status, setStatus] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const selectOption = (name, value) => {
    if (name === "profession") setProfession(value);
    if (name === "specialty") setSpecialty(value);
    if (name === "status") setStatus(value);
    setOpenDropdown(null);
  };

  // ✅ Fake data mới cho table
  const projectList = [
    {
      id: 1,
      englishName: "AI Recognition System",
      vietnameseName: "Hệ thống nhận diện khuôn mặt AI",
      abbreviation: "AIRS",
      mentor: "Dr. Nguyen Van A",
      role: "01",
    },
    {
      id: 2,
      englishName: "IoT Smart Home",
      vietnameseName: "Ngôi nhà thông minh IoT",
      abbreviation: "IOTSH",
      mentor: "Prof. Tran Thi B",
      role: "02",
    },
    {
      id: 3,
      englishName: "E-Learning Platform",
      vietnameseName: "Nền tảng học trực tuyến",
      abbreviation: "ELP",
      mentor: "Dr. Le Van C",
      role: "03",
    },
  ];

  return (
    <>
      <div className="w-full flex h-full bg-[#E8E8E8]">
        {/* ✅ Đổi đúng component */}
        <div className="w-[20%] h-full">
          <ResearchManagementOfficeMenu />
        </div>

        <div className="w-[80%] mx-auto flex flex-col">
          <HeaderResearchManagementOffice />
          <div className="w-[95%] mx-auto flex-1 rounded-2xl mt-[20px] p-6 bg-white">
            <div className="flex justify-center">
              <h1 className="text-xl font-bold mb-6">
                The list of Supervisor's Ideas
              </h1>
            </div>

            <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden mt-6">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">
                    Project English Name
                  </th>
                  <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">
                    Project Vietnamese Name
                  </th>
                  <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">
                    Abbreviation
                  </th>
                  <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">
                    Mentor
                  </th>
                  <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {projectList.map((proj) => (
                  <tr key={proj.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b">{proj.englishName}</td>
                    <td className="py-3 px-4 border-b">
                      {proj.vietnameseName}
                    </td>
                    <td className="py-3 px-4 border-b">{proj.abbreviation}</td>
                    <td className="py-3 px-4 border-b">{proj.mentor}</td>
                    <td className="py-3 px-4 border-b">
                      {proj.role === "01" ? (
                        <button className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                          View
                        </button>
                      ) : proj.role === "02" ? (
                        <button className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                          View
                        </button>
                      ) : proj.role === "03" ? (
                        <button className="px-3 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600">
                          Request Join
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
