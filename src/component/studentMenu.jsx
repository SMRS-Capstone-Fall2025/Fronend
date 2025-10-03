import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouseChimney } from "@fortawesome/free-solid-svg-icons";

export default function studentMenu() {
  return (
    <>
      {/* this is logo */}
      <div className="flex w-full h-screen bg-white">
        <div className="mx-auto mt-[20px] h-[300px]  w-[80%]">
          {/* img and SRMS  */}
          <div>
            {/* img  */}
            <div className="">
              <img src="" alt="" />
            </div>
            {/* SRMS  */}
            <div>
              <h1 className="text-[22px]">SRMS</h1>
            </div>
          </div>
          {/* content menu  */}
          <div className="w-full mt-[20px] gap-[12px]  flex flex-col">
            {/* icon and content 1 */}
            <div className="flex  bg-[#FAFAFA] gap-[10px]  h-[50px] items-center">
              {/* icon  */}
              <div className="text-[20px] ml-[12px]">
                <FontAwesomeIcon icon={faHouseChimney} />
              </div>
              {/* content  */}
              <div className="text-gray-700 ">Home</div>
            </div>{" "}
            {/* icon and content 2 */}
            <div className="flex  bg-[#FAFAFA] gap-[10px]  h-[50px] items-center">
              {/* icon  */}
              <div className="text-[20px] ml-[12px]">
                <FontAwesomeIcon icon={faHouseChimney} />
              </div>
              {/* content  */}
              <div className="text-gray-700 ">New</div>
            </div>{" "}
            {/* icon and content 3 */}
            <div className="flex  bg-[#FAFAFA] gap-[10px]  h-[50px] items-center">
              {/* icon  */}
              <div className="text-[20px] ml-[12px]">
                <FontAwesomeIcon icon={faHouseChimney} />
              </div>
              {/* content  */}
              <div className="text-gray-700 ">
                Register new reseach projects
              </div>
            </div>{" "}
            {/* icon and content 4 */}
            <div className="flex  bg-[#FAFAFA] gap-[10px]  h-[50px] items-center">
              {/* icon  */}
              <div className="text-[20px] ml-[12px]">
                <FontAwesomeIcon icon={faHouseChimney} />
              </div>
              {/* content  */}
              <div className="text-gray-700 ">Submit report</div>
            </div>{" "}
            {/* icon and content 5 */}
            <div className="flex  bg-[#FAFAFA] gap-[10px]  h-[50px] items-center">
              {/* icon  */}
              <div className="text-[20px] ml-[12px]">
                <FontAwesomeIcon icon={faHouseChimney} />
              </div>
              {/* content  */}
              <div className="text-gray-700 ">Invite Supervisors</div>
            </div>{" "}
            {/* icon and content 6 */}
            <div className="flex  bg-[#FAFAFA] gap-[10px]  h-[50px] items-center">
              {/* icon  */}
              <div className="text-[20px] ml-[12px]">
                <FontAwesomeIcon icon={faHouseChimney} />
              </div>
              {/* content  */}
              <div className="text-gray-700 ">Ideals of supervisors</div>
            </div>
            {/* icon and content 7 */}
            <div className="flex  bg-[#FAFAFA] gap-[10px]  h-[50px] items-center">
              {/* icon  */}
              <div className="text-[20px] ml-[12px]">
                <FontAwesomeIcon icon={faHouseChimney} />
              </div>
              {/* content  */}
              <div className="text-gray-700 ">Support</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
