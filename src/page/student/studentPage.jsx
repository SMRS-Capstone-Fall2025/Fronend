import React from "react";
import StudentMenu from "../../component/studentMenu";
import HeaderStudent from "../../component/headerStudent";
export default function studentPage() {
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
        </div>
      </div>
    </>
  );
}
