import React from "react";
import HeaderAdmin from "../../component/headerAdmin"; // Giữ đúng tên file thật
import AdminMenu from "../../component/adminMenu"; // import AdminMenu vào

export default function AdminPage() {
  return (
    <div className="w-full flex h-full bg-[#E8E8E8]">
      {/* menuleft */}
      <div className="w-[20%] h-full">
        <AdminMenu />
      </div>

      {/* right content */}
      <div className="w-[80%] mx-auto flex flex-col">
        <headerAdmin />
        <div className="w-[95%] mx-auto flex-1 rounded-2xl mt-[20px] p-6 bg-white">
          <h1 className="font-bold text-[25px]">Statistics</h1>
        </div>
      </div>
    </div>
  );
}
