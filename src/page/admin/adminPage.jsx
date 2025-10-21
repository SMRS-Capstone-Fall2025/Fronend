import React from "react";
import HeaderAdmin from "../../component/headerAdmin";
import AdminMenu from "../../component/adminMenu";

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
        <div className="w-[95%] mx-auto flex-1 rounded-2xl mt-[20px] p-6 bg-white"></div>
      </div>
    </div>
  );
}
