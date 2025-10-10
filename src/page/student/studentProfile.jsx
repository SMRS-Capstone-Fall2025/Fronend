import React from "react";
import HeaderStudent from "../../component/headerStudent";
import StudentMenu from "../../component/studentMenu";

export default function StudentProfilePage() {
  return (
    <div className="flex w-full bg-[#F4F5F7] min-h-screen">
      {/* Sidebar */}
      <div className="w-[20%] bg-white shadow-sm">
        <StudentMenu />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <HeaderStudent />

        <div className="mt-6 space-y-6">
          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow p-6 border-t-4 border-blue-600">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">
              Profile Information
            </h2>
            <div className="grid grid-cols-2 gap-y-3 text-gray-800">
              <p>
                <strong>Name:</strong> Nguyen Van A
              </p>
              <p>
                <strong>Email:</strong> a.nguyen@student.edu.vn
              </p>
              <p>
                <strong>Student ID:</strong> DE170325
              </p>
              <p>
                <strong>Phone:</strong> 0123456789
              </p>
              <p>
                <strong>Class:</strong> K17 - Software Engineering
              </p>
              <p>
                <strong>Supervisor:</strong> Dr. Tran Thi B
              </p>
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-white rounded-xl shadow p-6 border-t-4 border-green-600">
            <h2 className="text-2xl font-bold text-green-800 mb-4">
              Project Details
            </h2>
            <div className="space-y-2 text-gray-800">
              <p>
                <strong>Title:</strong> AI-based Document Classification System
              </p>
              <p>
                <strong>Description:</strong> A web platform that automates the
                classification of academic documents using machine learning.
              </p>
              <p>
                <strong>Start Date:</strong> 2025-03-01
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="bg-yellow-200 text-yellow-900 px-3 py-1 rounded-md text-sm">
                  In Progress
                </span>
              </p>
            </div>
          </div>

          {/* Submit Your Files */}
          <div className="bg-white rounded-xl shadow p-6 border-t-4 border-indigo-500">
            <h2 className="text-2xl font-bold text-indigo-800 mb-4">
              Submit Your Files
            </h2>
            <form className="space-y-4">
              <div>
                <label className="font-semibold">Select File</label>
                <input
                  type="file"
                  className="block w-full mt-2 border border-gray-300 rounded-md p-2"
                />
              </div>

              <div>
                <label className="font-semibold">File Type</label>
                <select className="block w-full mt-2 border border-gray-300 rounded-md p-2">
                  <option>Report</option>
                  <option>Presentation</option>
                  <option>Other</option>
                </select>
              </div>

              <button
                type="button"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Submit
              </button>
            </form>
          </div>

          {/* Submitted Files Table */}
          <div className="bg-white rounded-xl shadow p-6 border-t-4 border-orange-500">
            <h2 className="text-2xl font-bold text-orange-800 mb-4">
              Submitted Files
            </h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3 border-b">File Name</th>
                  <th className="p-3 border-b">Type</th>
                  <th className="p-3 border-b">Submission Date</th>
                  <th className="p-3 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border-b">report_v1.pdf</td>
                  <td className="p-3 border-b">Report</td>
                  <td className="p-3 border-b">2025-10-05</td>
                  <td className="p-3 border-b">
                    <span className="bg-green-200 text-green-800 px-3 py-1 rounded-md text-sm">
                      Reviewed
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 border-b">slides.pptx</td>
                  <td className="p-3 border-b">Presentation</td>
                  <td className="p-3 border-b">2025-10-06</td>
                  <td className="p-3 border-b">
                    <span className="bg-yellow-200 text-yellow-900 px-3 py-1 rounded-md text-sm">
                      Pending
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
