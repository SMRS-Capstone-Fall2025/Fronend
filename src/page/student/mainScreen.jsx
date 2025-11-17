import React, { useState } from "react";
import StudentMenu from "../../component/studentMenu";
import HeaderStudent from "../../component/headerStudent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import ModalListStudent from "../../component/modalListStudent";

export default function MainScreen() {
  const [profession, setProfession] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [status, setStatus] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ role test

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const selectOption = (name, value) => {
    if (name === "profession") setProfession(value);
    if (name === "specialty") setSpecialty(value);
    if (name === "status") setStatus(value);
    setOpenDropdown(null);
  };

  // ✅ Fake data để test
  const projectList = [
    {
      id: 1,
      name: "AI Recognition System",
      summary: "Deep learning for face recogniâtion",
      status: "In Progress",
      members: [
        "https://i.pravatar.cc/100?img=1",
        "https://i.pravatar.cc/100?img=2",
        "https://i.pravatar.cc/100?img=3",
      ],
      role: "01", // Hội đồng
    },
    {
      id: 2,
      name: "IoT Smart Home",
      summary: "Home automation using sensors",
      status: "Done",
      members: [
        "https://i.pravatar.cc/100?img=4",
        "https://i.pravatar.cc/100?img=5",
      ],
      role: "02", // Nhóm trưởng
    },
    {
      id: 3,
      name: "E-Learning Platform",
      summary: "Web-based study platform",
      status: "Pending",
      members: [
        "https://i.pravatar.cc/100?img=6",
        "https://i.pravatar.cc/100?img=7",
        "https://i.pravatar.cc/100?img=8",
      ],
      role: "03", // Member
    },
  ];

  return (
    <>
      <div className="w-full flex h-full bg-[#E8E8E8]">
        <div className="w-[20%] h-full">
          <StudentMenu />
        </div>

        <div className="w-[80%] mx-auto flex flex-col">
          <HeaderStudent />
          <div className="w-[95%] mx-auto flex-1 rounded-2xl mt-[20px] p-6 bg-white">
            <div className="flex flex-col gap-6">
              <h1 className="font-bold text-[25px]">Project</h1>

              <div className="flex">
                <div className="flex gap-6">
                  {/* Profession */}
                  <div className="relative">
                    <div
                      className="bg-gray-200 text-black px-3 py-2 rounded-md cursor-pointer w-40 flex justify-between items-center"
                      onClick={() => toggleDropdown("profession")}
                    >
                      {profession || "Profession"}
                      <span
                        className={`ml-2 transform transition-transform duration-200 ${
                          openDropdown === "profession"
                            ? "rotate-180"
                            : "rotate-0"
                        }`}
                      >
                        ▼
                      </span>
                    </div>
                    {openDropdown === "profession" && (
                      <div className="absolute left-0 mt-1 w-40 bg-gray-200 rounded-md shadow-lg z-10">
                        {["Students", "Engineer", "Lecture"].map((p) => (
                          <div
                            key={p}
                            className="px-3 py-2 hover:bg-gray-300 cursor-pointer"
                            onClick={() => selectOption("profession", p)}
                          >
                            {p}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Specialty */}
                  <div className="relative">
                    <div
                      className="bg-gray-200 text-black px-3 py-2 rounded-md cursor-pointer w-40 flex justify-between items-center"
                      onClick={() => toggleDropdown("specialty")}
                    >
                      {specialty || "Specialty"}
                      <span
                        className={`ml-2 transform transition-transform duration-200 ${
                          openDropdown === "specialty"
                            ? "rotate-180"
                            : "rotate-0"
                        }`}
                      >
                        ▼
                      </span>
                    </div>
                    {openDropdown === "specialty" && (
                      <div className="absolute left-0 mt-1 w-40 bg-gray-200 rounded-md shadow-lg z-10">
                        {[
                          "Biotechnology",
                          "Information Technology",
                          "Computer Science",
                        ].map((s) => (
                          <div
                            key={s}
                            className="px-3 py-2 hover:bg-gray-300 cursor-pointer"
                            onClick={() => selectOption("specialty", s)}
                          >
                            {s}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="relative">
                    <div
                      className="bg-gray-200 text-black px-3 py-2 rounded-md cursor-pointer w-40 flex justify-between items-center"
                      onClick={() => toggleDropdown("status")}
                    >
                      {status || "Status"}
                      <span
                        className={`ml-2 transform transition-transform duration-200 ${
                          openDropdown === "status" ? "rotate-180" : "rotate-0"
                        }`}
                      >
                        ▼
                      </span>
                    </div>
                    {openDropdown === "status" && (
                      <div className="absolute left-0 mt-1 w-40 bg-gray-200 rounded-md shadow-lg z-10">
                        {["Active", "Inactive", "Pending"].map((st) => (
                          <div
                            key={st}
                            className="px-3 py-2 hover:bg-gray-300 cursor-pointer"
                            onClick={() => selectOption("status", st)}
                          >
                            {st}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-auto flex items-center">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-[350px] pr-10 pl-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* --- Table --- */}
              <div className="p-6">
                <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">
                        Name Project
                      </th>
                      <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">
                        Summary
                      </th>
                      <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">
                        Status
                      </th>
                      <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">
                        Member
                      </th>
                      <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* map / get dữ liệu từ api xử lý đổ ra table  */}
                    {projectList.map((proj) => (
                      <tr key={proj.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 border-b">{proj.name}</td>
                        <td className="py-3 px-4 border-b">{proj.summary}</td>
                        <td className="py-3 px-4 border-b">
                          <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${
                              proj.status === "Done"
                                ? "text-green-700 bg-green-100"
                                : proj.status === "In Progress"
                                ? "text-yellow-700 bg-yellow-100"
                                : "text-gray-700 bg-gray-100"
                            }`}
                          >
                            {proj.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 border-b">
                          <div className="flex -space-x-2">
                            {proj.members.map((m, i) => (
                              <img
                                key={i}
                                src={m}
                                alt="Member"
                                className="w-8 h-8 rounded-full border-2 border-white"
                              />
                            ))}
                          </div>
                        </td>

                        {/* --- Hiển thị button theo role --- */}
                        <td className="py-3 px-4 border-b">
                          {/* button hiển thị theo role 01 */}

                          {proj.role === "01" ? (
                            <div className="flex gap-2">
                              <button className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                                Update
                              </button>
                              <button className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600">
                                Delete
                              </button>
                            </div>
                          ) : proj.role === "02" ? (
                            <div className="flex gap-2">
                              <button className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                                Update
                              </button>
                              <button className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600">
                                Accept
                              </button>
                              <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                              >
                                Find Member
                              </button>
                            </div>
                          ) : proj.role === "03" ? (
                            <div className="flex gap-2">
                              <button className="px-3 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600">
                                Request Join
                              </button>
                            </div>
                          ) : null}
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

      {isModalOpen && (
        <ModalListStudent onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}
