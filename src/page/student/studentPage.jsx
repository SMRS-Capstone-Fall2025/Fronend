import React, { useState } from "react";
import StudentMenu from "../../component/studentMenu";
import HeaderStudent from "../../component/headerStudent";

export default function StudentPage() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [groupName, setGroupName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [approvalFlow, setApprovalFlow] = useState("mentor");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    // Full name
    if (!fullName.trim()) {
      newErrors.fullName = "Full Name is required.";
    } else if (fullName.length > 30) {
      newErrors.fullName = "Full Name cannot exceed 30 characters.";
    }

    // Phone number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
    } else if (!phoneRegex.test(phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 10 digits (0–9).";
    }

    // Group name
    if (!groupName.trim()) {
      newErrors.groupName = "Group Name is required.";
    } else if (groupName.length > 20) {
      newErrors.groupName = "Group Name cannot exceed 20 characters.";
    }

    // Title
    if (!title.trim()) {
      newErrors.title = "Title is required.";
    } else if (title.length > 30) {
      newErrors.title = "Title cannot exceed 30 characters.";
    }

    // Description
    if (!description.trim()) {
      newErrors.description = "Description is required.";
    } else if (description.length > 300) {
      newErrors.description = "Description cannot exceed 300 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      alert("Form submitted successfully!");
    } else {
      alert("Please fill in all the required information.");
    }
  };

  return (
    <div className="w-full flex h-screen bg-[#E8E8E8] overflow-hidden">
      {/* Menu bên trái */}
      <div className="w-[20%] h-full">
        <StudentMenu />
      </div>

      {/*  */}
      <div className="w-[80%] flex flex-col h-full">
        <HeaderStudent />

        {/*  */}
        <div className="flex flex-1 justify-center items-center overflow-y-auto">
          <div className="w-[75%] bg-white rounded-2xl shadow-md p-8 flex flex-col items-center">
            <h1 className="text-xl font-bold mb-4">
              Register new research projects
            </h1>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 items-start"
            >
              {/* Full Name */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[15px]">Full Name:</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-[32px] w-[500px] rounded-[20px] border border-gray-300 px-4 focus:ring-1 focus:ring-blue-500 outline-none"
                  type="text"
                />
                {errors.fullName && (
                  <span className="text-red-500 text-sm">
                    {errors.fullName}
                  </span>
                )}
              </div>
              {/* Phone Number */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[15px]">Phone number:</label>
                <input
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    if (value.length <= 10) {
                      setPhoneNumber(value);
                    }
                  }}
                  maxLength={10}
                  className="h-[32px] w-[500px] rounded-[20px] border border-gray-300 px-4 focus:ring-1 focus:ring-blue-500 outline-none"
                  type="text"
                />
                {errors.phoneNumber && (
                  <span className="text-red-500 text-sm">
                    {errors.phoneNumber}
                  </span>
                )}
              </div>

              {/* Group Name */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[15px]">Group Name:</label>
                <input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="h-[32px] w-[500px] rounded-[20px] border border-gray-300 px-4 focus:ring-1 focus:ring-blue-500 outline-none"
                  type="text"
                />
                {errors.groupName && (
                  <span className="text-red-500 text-sm">
                    {errors.groupName}
                  </span>
                )}
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[15px]">Title:</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-[32px] w-[500px] rounded-[20px] border border-gray-300 px-4 focus:ring-1 focus:ring-blue-500 outline-none"
                  type="text"
                />
                {errors.title && (
                  <span className="text-red-500 text-sm">{errors.title}</span>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[15px]">Description:</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-[80px] w-[500px] rounded-[10px] border border-gray-300 px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                />
                {errors.description && (
                  <span className="text-red-500 text-sm">
                    {errors.description}
                  </span>
                )}
              </div>

              {/* Approval Flow */}
              <div className="flex flex-col gap-2">
                <p className="text-[15px] font-bold">Approval Flow:</p>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="approval"
                      value="mentor"
                      checked={approvalFlow === "mentor"}
                      onChange={() => setApprovalFlow("mentor")}
                      className="w-4 h-4 accent-blue-500"
                    />
                    Mentor
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="approval"
                      value="council"
                      checked={approvalFlow === "council"}
                      onChange={() => setApprovalFlow("council")}
                      className="w-4 h-4 accent-blue-500"
                    />
                    Council
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-center w-full mt-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition w-[300px]"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
