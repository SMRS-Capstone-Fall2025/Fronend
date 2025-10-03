import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import anh1 from "../img/1.webp";

export default function HeaderStudent() {
  return (
    <div className="w-full h-[40px] flex items-center gap-3 px-4">
      {/* Input Search */}
      <div className="relative flex-1">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </span>
        <input
          className="w-full pl-8 pr-2 py-1 rounded outline-none"
          placeholder="Search"
          type="text"
        />
      </div>

      {/* Profile + Logout */}
      <div className="flex items-center gap-2">
        <img
          src={anh1}
          className="w-[24px] h-[24px] rounded-full"
          alt="Student"
        />
        <p className="whitespace-nowrap">Student</p>
        <button className="text-gray-600 hover:text-red-500">
          <FontAwesomeIcon icon={faRightFromBracket} />
        </button>
      </div>
    </div>
  );
}
