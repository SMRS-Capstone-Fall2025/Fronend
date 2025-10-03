import React from "react";
import StudentMenu from "../../component/studentMenu";
import HeaderStudent from "../../component/headerStudent";

export default function MainScreen() {
  return (
    <>
      <div className="w-full flex h-full bg-[#E8E8E8]">
        {/* menuleft */}
        <div className="w-[20%] h-full">
          <StudentMenu />
        </div>
        {/* righ content  */}
        <div className="w-[80%] mx-auto flex flex-col">
          <HeaderStudent />
          <div className="w-[95%] mx-auto flex-1 rounded-2xl mt-[20px] p-6 bg-white">
            {/* title */}
            <div className="flex justify-center">
              <h1 className="text-xl font-bold mb-6">
                Capstone Project/ Thesis Proposal{" "}
              </h1>
            </div>

            {/* form fields */}
            <div className="w-[90%] ml-[50px] mx-auto space-y-4">
              <div className="flex gap-8">
                {/* Profession */}
                <div className="flex-1">
                  <p className="text-[16px] font-bold">Profession:</p>
                  <select
                    className="h-[36px] rounded-[20px] border border-gray-300 px-4 
                   focus:outline-none focus:ring-1 focus:ring-blue-500 mt-1 w-full font-bold"
                  >
                    <option value="">-- Select Profession --</option>
                    <option value="teacher">Teacher</option>
                    <option value="doctor">Supervisor</option>
                    <option value="engineer">Department Staff</option>
                    <option value="student">Student</option>
                    <option value="student">Supervisor</option>
                  </select>
                </div>

                {/* Specialty */}
                <div className="flex-1">
                  <p className="text-[16px] font-bold">Specialty:</p>
                  <select
                    className="h-[36px] rounded-[20px] border border-gray-300 px-4 
                   focus:outline-none focus:ring-1 focus:ring-blue-500 mt-1 w-full font-bold"
                  >
                    <option value="">-- Select Specialty --</option>
                    <option value="it">Information Technology</option>
                    <option value="medicine">Computer Science</option>
                    <option value="law">Artificial Intelligence</option>
                    <option value="business">Data Science</option>
                    <option value="business">Business Administration</option>
                    <option value="business">Mechanical Engineering</option>
                    <option value="business">Biotechnology</option>
                  </select>
                </div>
              </div>
            </div>
            <div>
              <p className="text-[16px] font-bold">
                Input Topic Name or Tags to search:
              </p>
              <div className="relative mt-1 w-[600px]">
                <input
                  className="h-[36px] rounded-[20px] border border-gray-300 px-4 
                 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full pr-12"
                  type="text"
                  placeholder="type here..."
                />
                {/* Search icon */}
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 
                 text-gray-500 hover:text-blue-500"
                >
                  🔍
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
