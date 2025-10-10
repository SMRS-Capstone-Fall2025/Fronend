import React from "react";
import ResearchManagementOfficeMenu from "../../component/researchManagementOfficeMenu";
import HeaderResearchManagementOffice from "../../component/headerResearchManagementOffice";
export default function ResearchManagementOfficePage() {
  return (
    <>
      <div className="w-full flex h-full bg-[#E8E8E8]">
        {/* menuleft */}
        <div className="w-[20%] h-full">
          <ResearchManagementOfficeMenu />
        </div>
        {/* righ content  */}
        <div className="w-[80%] mx-auto flex flex-col">
          <HeaderResearchManagementOffice />
        </div>
      </div>
    </>
  );
}
