import React, { useState } from "react";
import StudentMenu from "../../component/studentMenu";
import HeaderStudent from "../../component/headerStudent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

export default function MainScreen() {
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
                        <div
                          className="px-3 py-2 hover:bg-gray-300 cursor-pointer"
                          onClick={() => selectOption("profession", "Students")}
                        >
                          Students
                        </div>
                        <div
                          className="px-3 py-2 hover:bg-gray-300 cursor-pointer"
                          onClick={() => selectOption("profession", "Engineer")}
                        >
                          Engineer
                        </div>
                        <div
                          className="px-3 py-2 hover:bg-gray-300 cursor-pointer"
                          onClick={() => selectOption("profession", "Teacher")}
                        >
                          Lecture
                        </div>
                      </div>
                    )}
                  </div>

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
                        <div
                          className="px-3 py-2 hover:bg-gray-300 cursor-pointer"
                          onClick={() =>
                            selectOption("specialty", "Biotechnology")
                          }
                        >
                          Biotechnology
                        </div>
                        <div
                          className="px-3 py-2 hover:bg-gray-300 cursor-pointer"
                          onClick={() =>
                            selectOption("specialty", "Information Technology")
                          }
                        >
                          Information Technology
                        </div>
                        <div
                          className="px-3 py-2 hover:bg-gray-300 cursor-pointer"
                          onClick={() =>
                            selectOption("specialty", "Computer Science")
                          }
                        >
                          Computer Science
                        </div>
                      </div>
                    )}
                  </div>

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
                        <div
                          className="px-3 py-2 hover:bg-gray-300 cursor-pointer"
                          onClick={() => selectOption("status", "Active")}
                        >
                          Active
                        </div>
                        <div
                          className="px-3 py-2 hover:bg-gray-300 cursor-pointer"
                          onClick={() => selectOption("status", "Inactive")}
                        >
                          Inactive
                        </div>
                        <div
                          className="px-3 py-2 hover:bg-gray-300 cursor-pointer"
                          onClick={() => selectOption("status", "Pending")}
                        >
                          Pending
                        </div>
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
              <div className="flex space-x-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select className="border rounded-lg px-3 py-2 w-40">
                    <option value="">-- Chọn trạng thái --</option>
                    <option value="full">Full (Nhóm đã tối đa 5 người)</option>
                    <option value="find">
                      Find Member (Nhóm đang 3 người, muốn thêm)
                    </option>
                    <option value="paused">
                      Paused (Nhóm trưởng dừng nhận thành viên)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Member
                  </label>
                  <select className="border rounded-lg px-3 py-2 w-40">
                    <option value="">-- Thành viên nhóm --</option>
                    <option value="1">Nguyễn Văn A</option>
                    <option value="2">Trần Thị B</option>
                    <option value="3">Lê Văn C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Active
                  </label>
                  <select className="border rounded-lg px-3 py-2 w-40">
                    <option value="">-- Trạng thái --</option>
                    <option value="empty">Trống (chưa ai pick)</option>
                    <option value="picked">Đã được chọn</option>
                    <option value="research">Nghiên cứu làm thêm</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
