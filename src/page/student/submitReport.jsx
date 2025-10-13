import React, { useState } from "react";
import StudentMenu from "../../component/studentMenu";
import HeaderStudent from "../../component/headerStudent";

export default function SubmitReport() {
  const [activeTab, setActiveTab] = useState("periodic");
  const [file, setFile] = useState(null);
  const [history, setHistory] = useState([
    {
      id: 1,
      name: "periodic_report1.pdf",
      date: "Oct 3, 2025",
      status: "Approved",
      url: "#",
    },
  ]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload your report first!");
      return;
    }

    const newReport = {
      id: Date.now(),
      name: file.name,
      date: new Date().toLocaleDateString(),
      status: "Pending",
      url: URL.createObjectURL(file),
    };

    setHistory((prev) => [...prev, newReport]);
    alert(`File "${file.name}" uploaded successfully!`);
    setFile(null);
  };

  const handleDownload = (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "report.pdf";
    link.click();
  };

  return (
    <div className="w-full flex h-screen bg-[#E8E8E8]">
      {/* Sidebar */}
      <div className="w-[20%] h-full">
        <StudentMenu />
      </div>

      {/* Main content */}
      <div className="w-[80%] mx-auto flex flex-col">
        <HeaderStudent />

        <div className="w-[95%] mx-auto flex-1 rounded-2xl mt-[20px] p-6 bg-white shadow-md overflow-y-auto">
          <h1 className="font-bold text-[24px] mb-6 text-gray-800">
            Submit Reports
          </h1>

          {/* Tabs */}
          <div className="flex mb-6 border-b-2 border-gray-200">
            <button
              className={`px-6 py-2 font-medium rounded-t-md ${
                activeTab === "periodic"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setActiveTab("periodic")}
            >
              Periodic Reports
            </button>
            <button
              className={`px-6 py-2 font-medium rounded-t-md ml-2 ${
                activeTab === "final"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setActiveTab("final")}
            >
              Final Reports
            </button>
          </div>

          {/* === Periodic Reports === */}
          {activeTab === "periodic" && (
            <div>
              <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                <p>
                  Deadline:{" "}
                  <span className="text-red-600 font-semibold">
                    Oct 15, 2025
                  </span>
                </p>
                <p className="text-gray-500">(7 days remaining)</p>
              </div>

              {/* Status cards */}
              <div className="bg-green-100 p-4 rounded-lg flex justify-between items-center mb-2">
                <p className="text-gray-800 font-semibold">
                  1st periodic report (submitted)
                </p>
                <span className="text-green-700 font-bold">✔</span>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
                <p className="text-gray-800 font-semibold">
                  2nd periodic report (not yet submitted)
                </p>
                <span className="text-gray-500 font-bold">↑</span>
              </div>

              {/* Upload area */}
              <form
                onSubmit={handleSubmit}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 mt-4 flex flex-col items-center justify-center text-center"
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="periodicUpload"
                />
                <label
                  htmlFor="periodicUpload"
                  className="cursor-pointer text-gray-500 hover:text-blue-500"
                >
                  {file ? (
                    <span className="font-medium text-gray-700">
                      {file.name}
                    </span>
                  ) : (
                    "Drag or click to upload PDF for 2nd periodic report"
                  )}
                </label>

                <button
                  type="submit"
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Submit
                </button>
              </form>

              {/* History Table */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Submission History
                </h2>
                <table className="w-full text-sm border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">File</th>
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-2">{item.name}</td>
                        <td className="p-2">{item.date}</td>
                        <td
                          className={`p-2 ${
                            item.status === "Approved"
                              ? "text-green-600"
                              : "text-gray-600"
                          }`}
                        >
                          {item.status}
                        </td>
                        <td className="p-2 text-blue-600 cursor-pointer hover:underline"
                          onClick={() => handleDownload(item.url)}
                        >
                          Download
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Feedback */}
              <div className="mt-6 bg-gray-50 border p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800">
                  Supervisor Feedback
                </h3>
                <p className="text-gray-700 mt-2 italic">
                  "Your analysis section is well written, but include the latest
                  dataset for better accuracy."
                </p>
              </div>
            </div>
          )}

          {/* === Final Reports === */}
          {activeTab === "final" && (
            <div className="flex flex-col gap-4">
              <p className="text-gray-700 font-medium">
                Please submit your final project report (PDF only).
              </p>

              <form
                onSubmit={handleSubmit}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center"
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="finalUpload"
                />
                <label
                  htmlFor="finalUpload"
                  className="cursor-pointer text-gray-500 hover:text-blue-500"
                >
                  {file ? (
                    <span className="font-medium text-gray-700">
                      {file.name}
                    </span>
                  ) : (
                    "Drag or click to upload your Final Report (PDF)"
                  )}
                </label>

                <button
                  type="submit"
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Submit
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
