import React, { useState } from "react";

export default function ModalListStudent({ onClose }) {
  // Fake danh sách sinh viên (thêm studentCode)
  const [students] = useState([
    { id: 1, name: "Nguyen Van A", code: "DE150001", email: "a@example.com" },
    { id: 2, name: "Tran Thi B", code: "DE150002", email: "b@example.com" },
    { id: 3, name: "Le Van C", code: "DE150003", email: "c@example.com" },
    { id: 4, name: "Pham Thi D", code: "DE150004", email: "d@example.com" },
    { id: 5, name: "Do Van E", code: "DE150005", email: "e@example.com" },
    { id: 6, name: "Bui Van F", code: "DE150006", email: "f@example.com" },
    { id: 7, name: "Ngo Thi G", code: "DE150007", email: "g@example.com" },
    { id: 8, name: "Tran Van H", code: "DE150008", email: "h@example.com" },
    { id: 9, name: "Le Thi I", code: "DE150009", email: "i@example.com" },
    { id: 10, name: "Nguyen Van K", code: "DE150010", email: "k@example.com" },
    { id: 11, name: "Do Thi L", code: "DE150011", email: "l@example.com" },
  ]);

  // State nhập trong ô input
  const [searchTerm, setSearchTerm] = useState("");
  // State dùng thực tế để lọc (chỉ cập nhật khi bấm Search)
  const [searchQuery, setSearchQuery] = useState("");

  // Lọc theo ô input (name, email, code)
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStudents = filteredStudents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Hàm xử lý khi nhấn nút Search
  const handleSearch = () => {
    setSearchQuery(searchTerm);
    setCurrentPage(1); // reset về trang đầu
  };

  return (
    <>
      {/* Lớp nền mờ */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        {/* Modal */}
        <div className="bg-white w-[1000px] h-[600px] rounded-lg shadow-lg p-6 relative flex flex-col">
          {/* Tiêu đề */}
          <h2 className="text-2xl font-bold mb-4 text-center">
            The list of Students in this Semester
          </h2>

          {/* Ô tìm kiếm */}
          <div className="flex items-center gap-3 mb-6">
            <label className="font-semibold text-gray-700 w-[200px] text-right">
              Email, Name or Code:
            </label>

            <input
              type="text"
              placeholder="Email, Name or Code"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Search
            </button>
          </div>

          {/* Bảng danh sách */}
          <div className="overflow-y-auto flex-1 border rounded-md">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b font-semibold">#</th>
                  <th className="py-2 px-4 border-b font-semibold">Name</th>
                  <th className="py-2 px-4 border-b font-semibold">
                    Student Code
                  </th>
                  <th className="py-2 px-4 border-b font-semibold">Email</th>
                  <th className="py-2 px-4 border-b font-semibold text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.length > 0 ? (
                  currentStudents.map((student, index) => (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-2 px-4 border-b">
                        {startIndex + index + 1}
                      </td>
                      <td className="py-2 px-4 border-b">{student.name}</td>
                      <td className="py-2 px-4 border-b">{student.code}</td>
                      <td className="py-2 px-4 border-b">{student.email}</td>
                      <td className="py-2 px-4 border-b  text-center">
                        <button className="bg-blue-500  text-white px-3 py-1 rounded-md hover:bg-blue-600">
                          Add
                        </button>
                        <button className="bg-yellow-500 ml-2 text-white px-3 py-1 rounded-md hover:bg-yellow-600">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-4 text-gray-500 italic"
                    >
                      No student found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          <div className="flex justify-center items-center mt-4 gap-2">
            {/* Nút Back */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md border ${
                currentPage === 1
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
            >
              ←
            </button>

            {/* Nút số trang */}
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => goToPage(i + 1)}
                className={`px-3 py-1 rounded-md border ${
                  currentPage === i + 1
                    ? "bg-blue-400 text-white border-blue-400"
                    : "hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}

            {/* Nút Next */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md border ${
                currentPage === totalPages
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
            >
              →
            </button>
          </div>

          {/* Nút đóng */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-600 hover:text-red-600 text-xl"
          >
            ✕
          </button>
        </div>
      </div>
    </>
  );
}
