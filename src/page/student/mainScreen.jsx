import React, { useState } from "react";
import StudentMenu from "../../component/studentMenu";
import HeaderStudent from "../../component/headerStudent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

export default function MainScreen() {
  const [profession, setProfession] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [status, setStatus] = useState("");

  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const selectOption = (name, value) => {
    if (name === "profession") setProfession(value);
    if (name === "specialty") setSpecialty(value);
    if (name === "status") setStatus(value);
    setOpenDropdown(null);
  };

  return (
    <>
      <div className="w-full flex h-full bg-[#E8E8E8]">
        <div className="w-[20%] h-full">
          <StudentMenu />
        </div>

        <div className="w-[80%] mx-auto flex flex-col">
          <HeaderStudent />
          <div className="w-[95%] mx-auto flex-1 rounded-2xl mt-[20px] p-6 bg-white">
            <div className="flex flex-col gap-6">
              <h1 className="font-bold text-[25px]">Project</h1>

              <div className="flex">
                <div className="flex gap-6">
                  <div className="relative">
                    <div
                      className="bg-gray-200 text-black px-3 py-2 rounded-md cursor-pointer w-40 flex justify-between items-center"
                      onClick={() => toggleDropdown("profession")}
                    >
                      {profession || "Profession"}
                      <span
                        className={`ml-2 transform transition-transform duration-200 ${
                          openDropdown === "profession"
                            ? "rotate-180"
                            : "rotate-0"
                        }`}
                      >
                        ▼
                      </span>
                    </div>
                    {openDropdown === "profession" && (
                      <div className="absolute left-0 mt-1 w-40 bg-gray-200 rounded-md shadow-lg z-10">
                        <div
                          className="px-3 py-2 hover:bg-gray-300 cursor-pointer"
                          onClick={() => selectOption("profession", "Students")}
                        >
                          Students
                        </div>
                        <div
                          className="px-3 py-2 hover:bg-gray-300 cursor-pointer"
                          onClick={() => selectOption("profession", "Engineer")}
                        >
                          Engineer
                        </div>
                        <div
                          className="px-3 py-2 hover:bg-gray-300 cursor-pointer"
                          onClick={() => selectOption("profession", "Teacher")}
                        >
                          Lecture
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <div
                      className="bg-gray-200 text-black px-3 py-2 rounded-md cursor-pointer w-40 flex justify-between items-center"
                      onClick={() => toggleDropdown("specialty")}
                    >
                      {specialty || "Specialty"}
                      <span
                        className={`ml-2 transform transition-transform duration-200 ${
                          openDropdown === "specialty"
                            ? "rotate-180"
                            : "rotate-0"
                        }`}
                      >
                        ▼
                      </span>
                    </div>
                    {openDropdown === "specialty" && (
                      <div className="absolute left-0 mt-1 w-40 bg-gray-200 rounded-md shadow-lg z-10">
                        <div
                          className="px-3 py-2 hover:bg-gray-300 cursor-pointer"
                          onClick={() =>
                            selectOption("specialty", "Biotechnology")
                          }
                        >
                          Biotechnology
                        </div>
                        <div
                          className="px-3 py-2 hover:bg-gray-300 cursor-pointer"
                          onClick={() =>
                            selectOption("specialty", "Information Technology")
                          }
                        >
                          Information Technology
                        </div>
                        <div
                          className="px-3 py-2 hover:bg-gray-300 cursor-pointer"
                          onClick={() =>
                            selectOption("specialty", "Computer Science")
                          }
                        >
                          Computer Science
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <div
                      className="bg-gray-200 text-black px-3 py-2 rounded-md cursor-pointer w-40 flex justify-between items-center"
                      onClick={() => toggleDropdown("status")}
                    >
                      {status || "Status"}
                      <span
                        className={`ml-2 transform transition-transform duration-200 ${
                          openDropdown === "status" ? "rotate-180" : "rotate-0"
                        }`}
                      >
                        ▼
                      </span>
                    </div>
                    {openDropdown === "status" && (
                      <div className="absolute left-0 mt-1 w-40 bg-gray-200 rounded-md shadow-lg z-10">
                        <div
                          className="px-3 py-2 hover:bg-gray-300 cursor-pointer"
                          onClick={() => selectOption("status", "Active")}
                        >
                          Active
                        </div>
                        <div
                          className="px-3 py-2 hover:bg-gray-300 cursor-pointer"
                          onClick={() => selectOption("status", "Inactive")}
                        >
                          Inactive
                        </div>
                        <div
                          className="px-3 py-2 hover:bg-gray-300 cursor-pointer"
                          onClick={() => selectOption("status", "Pending")}
                        >
                          Pending
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-auto flex items-center">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-[350px] pr-10 pl-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">
                        Name
                      </th>
                      <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">
                        Member
                      </th>
                      <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">
                        Project
                      </th>
                      <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* Row 1 */}
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">Nguyen Van A</td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex -space-x-2">
                          {[
                            "https://scontent.fhan14-3.fna.fbcdn.net/v/t39.30808-6/469536996_1358729488441325_3004502555982336904_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeGuGeXBE5-BWQlHJqZkhbfFe5NXCxgWqGB7k1cLGBaoYPATHlXaOhKlUUtAyIDlcaTR3tTafHVipjihCtWgfsyv&_nc_ohc=ESISgEPeznwQ7kNvwE_Kvmj&_nc_oc=Adlxv9UdqyLulO3eMvXMOE1vD_zvAeNT9DK-icRiSs3mGJHEOUBjdDhlSc_6Z4TTReFKg29pcF6WWJzM5AwPUEC5&_nc_zt=23&_nc_ht=scontent.fhan14-3.fna&_nc_gid=zkFYsQznPg8vZhvZNoOTww&oh=00_Afdpyn1omvgKnFbDMzVFtsLvR-FOGredNz4TghJjL2_DwQ&oe=68EADFD8",
                            "https://scontent.fhan14-3.fna.fbcdn.net/v/t39.30808-6/469536996_1358729488441325_3004502555982336904_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeGuGeXBE5-BWQlHJqZkhbfFe5NXCxgWqGB7k1cLGBaoYPATHlXaOhKlUUtAyIDlcaTR3tTafHVipjihCtWgfsyv&_nc_ohc=ESISgEPeznwQ7kNvwE_Kvmj&_nc_oc=Adlxv9UdqyLulO3eMvXMOE1vD_zvAeNT9DK-icRiSs3mGJHEOUBjdDhlSc_6Z4TTReFKg29pcF6WWJzM5AwPUEC5&_nc_zt=23&_nc_ht=scontent.fhan14-3.fna&_nc_gid=zkFYsQznPg8vZhvZNoOTww&oh=00_Afdpyn1omvgKnFbDMzVFtsLvR-FOGredNz4TghJjL2_DwQ&oe=68EADFD8",
                            "https://scontent.fhan14-3.fna.fbcdn.net/v/t39.30808-6/469536996_1358729488441325_3004502555982336904_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeGuGeXBE5-BWQlHJqZkhbfFe5NXCxgWqGB7k1cLGBaoYPATHlXaOhKlUUtAyIDlcaTR3tTafHVipjihCtWgfsyv&_nc_ohc=ESISgEPeznwQ7kNvwE_Kvmj&_nc_oc=Adlxv9UdqyLulO3eMvXMOE1vD_zvAeNT9DK-icRiSs3mGJHEOUBjdDhlSc_6Z4TTReFKg29pcF6WWJzM5AwPUEC5&_nc_zt=23&_nc_ht=scontent.fhan14-3.fna&_nc_gid=zkFYsQznPg8vZhvZNoOTww&oh=00_Afdpyn1omvgKnFbDMzVFtsLvR-FOGredNz4TghJjL2_DwQ&oe=68EADFD8",
                            "https://scontent.fhan14-3.fna.fbcdn.net/v/t39.30808-6/469536996_1358729488441325_3004502555982336904_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeGuGeXBE5-BWQlHJqZkhbfFe5NXCxgWqGB7k1cLGBaoYPATHlXaOhKlUUtAyIDlcaTR3tTafHVipjihCtWgfsyv&_nc_ohc=ESISgEPeznwQ7kNvwE_Kvmj&_nc_oc=Adlxv9UdqyLulO3eMvXMOE1vD_zvAeNT9DK-icRiSs3mGJHEOUBjdDhlSc_6Z4TTReFKg29pcF6WWJzM5AwPUEC5&_nc_zt=23&_nc_ht=scontent.fhan14-3.fna&_nc_gid=zkFYsQznPg8vZhvZNoOTww&oh=00_Afdpyn1omvgKnFbDMzVFtsLvR-FOGredNz4TghJjL2_DwQ&oe=68EADFD8",
                          ]
                            .slice(0, 5)
                            .map((src, index) => (
                              <img
                                key={index}
                                src={src}
                                alt={`Member ${index + 1}`}
                                className="w-8 h-8 rounded-full border-2 border-white"
                              />
                            ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b">AI Research</td>
                      <td className="py-3 px-4 border-b">
                        <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
                          Done
                        </span>
                      </td>
                    </tr>

                    {/* Row 2 */}
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">Tran Thi B</td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex -space-x-2">
                          {[
                            "https://scontent.fhan14-3.fna.fbcdn.net/v/t39.30808-6/469536996_1358729488441325_3004502555982336904_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeGuGeXBE5-BWQlHJqZkhbfFe5NXCxgWqGB7k1cLGBaoYPATHlXaOhKlUUtAyIDlcaTR3tTafHVipjihCtWgfsyv&_nc_ohc=ESISgEPeznwQ7kNvwE_Kvmj&_nc_oc=Adlxv9UdqyLulO3eMvXMOE1vD_zvAeNT9DK-icRiSs3mGJHEOUBjdDhlSc_6Z4TTReFKg29pcF6WWJzM5AwPUEC5&_nc_zt=23&_nc_ht=scontent.fhan14-3.fna&_nc_gid=zkFYsQznPg8vZhvZNoOTww&oh=00_Afdpyn1omvgKnFbDMzVFtsLvR-FOGredNz4TghJjL2_DwQ&oe=68EADFD8",
                            "https://scontent.fhan14-3.fna.fbcdn.net/v/t39.30808-6/469536996_1358729488441325_3004502555982336904_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeGuGeXBE5-BWQlHJqZkhbfFe5NXCxgWqGB7k1cLGBaoYPATHlXaOhKlUUtAyIDlcaTR3tTafHVipjihCtWgfsyv&_nc_ohc=ESISgEPeznwQ7kNvwE_Kvmj&_nc_oc=Adlxv9UdqyLulO3eMvXMOE1vD_zvAeNT9DK-icRiSs3mGJHEOUBjdDhlSc_6Z4TTReFKg29pcF6WWJzM5AwPUEC5&_nc_zt=23&_nc_ht=scontent.fhan14-3.fna&_nc_gid=zkFYsQznPg8vZhvZNoOTww&oh=00_Afdpyn1omvgKnFbDMzVFtsLvR-FOGredNz4TghJjL2_DwQ&oe=68EADFD8",
                            "https://scontent.fhan14-3.fna.fbcdn.net/v/t39.30808-6/469536996_1358729488441325_3004502555982336904_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeGuGeXBE5-BWQlHJqZkhbfFe5NXCxgWqGB7k1cLGBaoYPATHlXaOhKlUUtAyIDlcaTR3tTafHVipjihCtWgfsyv&_nc_ohc=ESISgEPeznwQ7kNvwE_Kvmj&_nc_oc=Adlxv9UdqyLulO3eMvXMOE1vD_zvAeNT9DK-icRiSs3mGJHEOUBjdDhlSc_6Z4TTReFKg29pcF6WWJzM5AwPUEC5&_nc_zt=23&_nc_ht=scontent.fhan14-3.fna&_nc_gid=zkFYsQznPg8vZhvZNoOTww&oh=00_Afdpyn1omvgKnFbDMzVFtsLvR-FOGredNz4TghJjL2_DwQ&oe=68EADFD8",
                          ]
                            .slice(0, 5)
                            .map((src, index) => (
                              <img
                                key={index}
                                src={src}
                                alt={`Member ${index + 1}`}
                                className="w-8 h-8 rounded-full border-2 border-white"
                              />
                            ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b">Web Platform</td>
                      <td className="py-3 px-4 border-b">
                        <span className="px-3 py-1 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-full">
                          In Progress
                        </span>
                      </td>
                    </tr>

                    {/* Row 3 */}
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">Le Van C</td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex -space-x-2">
                          {[
                            "https://scontent.fhan14-3.fna.fbcdn.net/v/t39.30808-6/469536996_1358729488441325_3004502555982336904_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeGuGeXBE5-BWQlHJqZkhbfFe5NXCxgWqGB7k1cLGBaoYPATHlXaOhKlUUtAyIDlcaTR3tTafHVipjihCtWgfsyv&_nc_ohc=ESISgEPeznwQ7kNvwE_Kvmj&_nc_oc=Adlxv9UdqyLulO3eMvXMOE1vD_zvAeNT9DK-icRiSs3mGJHEOUBjdDhlSc_6Z4TTReFKg29pcF6WWJzM5AwPUEC5&_nc_zt=23&_nc_ht=scontent.fhan14-3.fna&_nc_gid=zkFYsQznPg8vZhvZNoOTww&oh=00_Afdpyn1omvgKnFbDMzVFtsLvR-FOGredNz4TghJjL2_DwQ&oe=68EADFD8",
                            "https://scontent.fhan14-3.fna.fbcdn.net/v/t39.30808-6/469536996_1358729488441325_3004502555982336904_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeGuGeXBE5-BWQlHJqZkhbfFe5NXCxgWqGB7k1cLGBaoYPATHlXaOhKlUUtAyIDlcaTR3tTafHVipjihCtWgfsyv&_nc_ohc=ESISgEPeznwQ7kNvwE_Kvmj&_nc_oc=Adlxv9UdqyLulO3eMvXMOE1vD_zvAeNT9DK-icRiSs3mGJHEOUBjdDhlSc_6Z4TTReFKg29pcF6WWJzM5AwPUEC5&_nc_zt=23&_nc_ht=scontent.fhan14-3.fna&_nc_gid=zkFYsQznPg8vZhvZNoOTww&oh=00_Afdpyn1omvgKnFbDMzVFtsLvR-FOGredNz4TghJjL2_DwQ&oe=68EADFD8",
                            "https://scontent.fhan14-3.fna.fbcdn.net/v/t39.30808-6/469536996_1358729488441325_3004502555982336904_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeGuGeXBE5-BWQlHJqZkhbfFe5NXCxgWqGB7k1cLGBaoYPATHlXaOhKlUUtAyIDlcaTR3tTafHVipjihCtWgfsyv&_nc_ohc=ESISgEPeznwQ7kNvwE_Kvmj&_nc_oc=Adlxv9UdqyLulO3eMvXMOE1vD_zvAeNT9DK-icRiSs3mGJHEOUBjdDhlSc_6Z4TTReFKg29pcF6WWJzM5AwPUEC5&_nc_zt=23&_nc_ht=scontent.fhan14-3.fna&_nc_gid=zkFYsQznPg8vZhvZNoOTww&oh=00_Afdpyn1omvgKnFbDMzVFtsLvR-FOGredNz4TghJjL2_DwQ&oe=68EADFD8",
                            "https://scontent.fhan14-3.fna.fbcdn.net/v/t39.30808-6/469536996_1358729488441325_3004502555982336904_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeGuGeXBE5-BWQlHJqZkhbfFe5NXCxgWqGB7k1cLGBaoYPATHlXaOhKlUUtAyIDlcaTR3tTafHVipjihCtWgfsyv&_nc_ohc=ESISgEPeznwQ7kNvwE_Kvmj&_nc_oc=Adlxv9UdqyLulO3eMvXMOE1vD_zvAeNT9DK-icRiSs3mGJHEOUBjdDhlSc_6Z4TTReFKg29pcF6WWJzM5AwPUEC5&_nc_zt=23&_nc_ht=scontent.fhan14-3.fna&_nc_gid=zkFYsQznPg8vZhvZNoOTww&oh=00_Afdpyn1omvgKnFbDMzVFtsLvR-FOGredNz4TghJjL2_DwQ&oe=68EADFD8",
                          ]
                            .slice(0, 5)
                            .map((src, index) => (
                              <img
                                key={index}
                                src={src}
                                alt={`Member ${index + 1}`}
                                className="w-8 h-8 rounded-full border-2 border-white"
                              />
                            ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b">Mobile App</td>
                      <td className="py-3 px-4 border-b">
                        <span className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
                          Pause
                        </span>
                      </td>
                    </tr>

                    {/* Row 4 */}
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">Pham D</td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex -space-x-2">
                          {[
                            "https://scontent.fhan14-3.fna.fbcdn.net/v/t39.30808-6/469536996_1358729488441325_3004502555982336904_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeGuGeXBE5-BWQlHJqZkhbfFe5NXCxgWqGB7k1cLGBaoYPATHlXaOhKlUUtAyIDlcaTR3tTafHVipjihCtWgfsyv&_nc_ohc=ESISgEPeznwQ7kNvwE_Kvmj&_nc_oc=Adlxv9UdqyLulO3eMvXMOE1vD_zvAeNT9DK-icRiSs3mGJHEOUBjdDhlSc_6Z4TTReFKg29pcF6WWJzM5AwPUEC5&_nc_zt=23&_nc_ht=scontent.fhan14-3.fna&_nc_gid=zkFYsQznPg8vZhvZNoOTww&oh=00_Afdpyn1omvgKnFbDMzVFtsLvR-FOGredNz4TghJjL2_DwQ&oe=68EADFD8",
                            "https://scontent.fhan14-3.fna.fbcdn.net/v/t39.30808-6/469536996_1358729488441325_3004502555982336904_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeGuGeXBE5-BWQlHJqZkhbfFe5NXCxgWqGB7k1cLGBaoYPATHlXaOhKlUUtAyIDlcaTR3tTafHVipjihCtWgfsyv&_nc_ohc=ESISgEPeznwQ7kNvwE_Kvmj&_nc_oc=Adlxv9UdqyLulO3eMvXMOE1vD_zvAeNT9DK-icRiSs3mGJHEOUBjdDhlSc_6Z4TTReFKg29pcF6WWJzM5AwPUEC5&_nc_zt=23&_nc_ht=scontent.fhan14-3.fna&_nc_gid=zkFYsQznPg8vZhvZNoOTww&oh=00_Afdpyn1omvgKnFbDMzVFtsLvR-FOGredNz4TghJjL2_DwQ&oe=68EADFD8",
                          ]
                            .slice(0, 5)
                            .map((src, index) => (
                              <img
                                key={index}
                                src={src}
                                alt={`Member ${index + 1}`}
                                className="w-8 h-8 rounded-full border-2 border-white"
                              />
                            ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b">System Refactor</td>
                      <td className="py-3 px-4 border-b">
                        <span className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full">
                          Backlog
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
