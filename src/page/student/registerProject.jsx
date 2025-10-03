import React from "react";
import StudentMenu from "../../component/studentMenu";
import HeaderStudent from "../../component/headerStudent";

export default function RegisterProject() {
  return (
    <>
      <div className="w-full flex h-screen bg-[#E8E8E8] overflow-hidden">
        {/* menu left */}
        <div className="w-[20%] h-full">
          <StudentMenu />
        </div>

        {/* right content */}
        <div className="w-[80%] flex flex-col h-full">
          {/* header */}
          <HeaderStudent />

          {/* content không scroll */}
          <div className="w-[95%] mx-auto flex-1 rounded-2xl mt-[20px] p-6 bg-white">
            {/* title */}
            <div className="flex justify-center">
              <h1 className="text-xl font-bold mb-6">
                Register new research projects
              </h1>
            </div>

            {/* form fields */}
            <div className="w-[90%] ml-[50px] mx-auto space-y-4">
              {/* Full Name */}
              <div>
                <p className="text-[16px] font-bold">Full Name:</p>
                <input
                  className="h-[32px] rounded-[20px] border border-gray-300 px-4 focus:outline-none focus:ring-1 focus:ring-blue-500 mt-1 w-[600px]"
                  type="text"
                />
              </div>

              {/* Group Name */}
              <div>
                <p className="text-[16px] font-bold">Group Name:</p>
                <input
                  className="h-[32px] rounded-[20px] border border-gray-300 px-4 focus:outline-none focus:ring-1 focus:ring-blue-500 mt-1 w-[600px]"
                  type="text"
                />
              </div>

              {/* Title */}
              <div>
                <p className="text-[16px] font-bold">Title:</p>
                <input
                  className="h-[32px] rounded-[20px] border border-gray-300 px-4 focus:outline-none focus:ring-1 focus:ring-blue-500 mt-1 w-[600px]"
                  type="text"
                />
              </div>

              {/* Description */}
              <div>
                <p className="text-[16px] font-bold">Description:</p>
                <textarea className="h-[100px] rounded-[10px] border border-gray-300 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 mt-1 w-[600px]" />
              </div>

              {/* Approval Flow */}
              <div>
                <p className="text-[16px] font-bold mb-1">Approval Flow:</p>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-[16px]">
                    <input
                      type="radio"
                      name="approval"
                      value="mentor"
                      className="w-5 h-5 accent-black"
                    />
                    Mentor
                  </label>

                  <label className="flex items-center gap-2 text-[16px]">
                    <input
                      type="radio"
                      name="approval"
                      value="council"
                      className="w-5 h-5 accent-black"
                    />
                    Council
                  </label>
                </div>
              </div>

              {/* Submit button */}
              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  className="px-6  mt-[40px] py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition w-[250px]"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
