import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouseChimney,
  faPen,
  faFileCircleCheck,
  faLightbulb,
  faQuestionCircle,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { faNewspaper } from "@fortawesome/free-regular-svg-icons";
import "./managerMenu.css"; // import file CSS

export default function ManagerMenu() {
  return (
    <>
      <div className="flex w-full h-screen bg-pattern">
        <div className="mx-auto mt-[20px] h-[300px] w-full">
          {/* logo và tên SRMS */}
          <div>
            <h1 className="text-[22px]  ml-24 font-bold ">SRMS</h1>
          </div>

          {/* content menu */}
          <div className="w-full mt-[20px] gap-[12px] flex flex-col">
            {/* Home */}
            <div className="group flex gap-[10px] h-[50px] items-center font-bold hover:bg-[#E8E8E8] cursor-pointer">
              <div className="text-[20px] text-white ml-[12px] group-hover:text-blue-400">
                <FontAwesomeIcon icon={faHouseChimney} />
              </div>
              <div className="text-white group-hover:text-blue-400">Home</div>
            </div>

            {/* New */}
            <div className="group flex gap-[10px] h-[50px] items-center font-bold hover:bg-[#E8E8E8] cursor-pointer">
              <div className="text-[20px] ml-[12px] text-white group-hover:text-blue-400">
                <FontAwesomeIcon icon={faNewspaper} />
              </div>
              <div className="text-white group-hover:text-blue-400">New</div>
            </div>

            {/* Register */}
            <div className="group flex gap-[10px] h-[50px] items-center font-bold hover:bg-[#E8E8E8] cursor-pointer">
              <div className="text-[20px] ml-[12px] text-white group-hover:text-blue-400">
                <FontAwesomeIcon icon={faPen} />
              </div>
              <div className="text-white group-hover:text-blue-400">
                Task/bug
              </div>
            </div>

            {/*  Invite Supervisors */}
            <div className="group flex gap-[10px] h-[50px] items-center font-bold hover:bg-[#E8E8E8] cursor-pointer">
              <div className="text-[20px] ml-[12px] text-white group-hover:text-blue-400">
                <FontAwesomeIcon icon={faFileCircleCheck} />
              </div>
              <div className="text-white group-hover:text-blue-400">
                Ideals of supervisors
              </div>
            </div>

            {/* support */}
            <div className="group flex gap-[10px] h-[50px] items-center font-bold hover:bg-[#E8E8E8] cursor-pointer">
              <div className="text-[20px] ml-[12px] text-white group-hover:text-blue-400">
                <FontAwesomeIcon icon={faUserPlus} />
              </div>
              <div className="text-white group-hover:text-blue-400">
                Support
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
