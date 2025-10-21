import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouseChimney } from "@fortawesome/free-solid-svg-icons";

export default function AdminMenu() {
  return (
    <>
      <div className="flex w-full h-screen bg-white">
        <div className="mx-auto mt-[20px] h-[300px] w-[80%]">
          <div>
            <div></div>
            <div>
              <h1 className="text-[22px] ">SRMS</h1>
            </div>
          </div>

          <div className="w-full mt-[20px] gap-[12px] flex flex-col">
            <div className="flex bg-[#FAFAFA] gap-[10px] h-[50px] items-center">
              <div className="text-[20px] ml-[12px]">
                <FontAwesomeIcon icon={faHouseChimney} />
              </div>
              <div className="text-gray-700">Dashboard</div>
            </div>

            <div className="flex bg-[#FAFAFA] gap-[10px] h-[50px] items-center">
              <div className="text-[20px] ml-[12px]">
                <FontAwesomeIcon icon={faHouseChimney} />
              </div>
              <div className="text-gray-700">New</div>
            </div>

            <div className="flex bg-[#FAFAFA] gap-[10px] h-[50px] items-center">
              <div className="text-[20px] ml-[12px]">
                <FontAwesomeIcon icon={faHouseChimney} />
              </div>
              <div className="text-gray-700">Project Management</div>
            </div>

            <div className="flex bg-[#FAFAFA] gap-[10px] h-[50px] items-center">
              <div className="text-[20px] ml-[12px]">
                <FontAwesomeIcon icon={faHouseChimney} />
              </div>
              <div className="text-gray-700">Statistics & Reports</div>
            </div>

            <div className="flex bg-[#FAFAFA] gap-[10px] h-[50px] items-center">
              <div className="text-[20px] ml-[12px]">
                <FontAwesomeIcon icon={faHouseChimney} />
              </div>
              <div className="text-gray-700">User Management</div>
            </div>

            <div className="flex bg-[#FAFAFA] gap-[10px] h-[50px] items-center">
              <div className="text-[20px] ml-[12px]">
                <FontAwesomeIcon icon={faHouseChimney} />
              </div>
              <div className="text-gray-700">Settings</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
