import React, { useState } from "react";
import StudentMenu from "../../component/studentMenu";
import HeaderStudent from "../../component/headerStudent";

export default function RegisterProject() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [groupName, setGroupName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [approvalFlow, setApprovalFlow] = useState("mentor");

  const [errorFullName, setErrorFullName] = useState("");
  const [errorPhone, setErrorPhone] = useState("");
  const [errorGroup, setErrorGroup] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [errorDescription, setErrorDescription] = useState("");

  // ✅ validate Full Name
  const handleFullNameChange = (e) => {
    const value = e.target.value;
    setFullName(value);

    if (!value.trim()) {
      setErrorFullName("You have not entered a Full Name");
    } else if (value.length > 30) {
      setErrorFullName("Full Name cannot exceed 30 characters");
    } else {
      setErrorFullName("");
    }
  };

  // ✅ validate Phone Number
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);

    if (!value.trim()) {
      setErrorPhone("You have not entered a Phone Number");
    } else if (value.length !== 10 || !/^[0-9]+$/.test(value)) {
      setErrorPhone("Phone Number must have exactly 10 digits");
    } else {
      setErrorPhone("");
    }
  };

  // ✅ validate Group Name
  const handleGroupChange = (e) => {
    const value = e.target.value;
    setGroupName(value);

    if (!value.trim()) {
      setErrorGroup("You have not entered a Group Name");
    } else if (value.length > 30) {
      setErrorGroup("Group Name cannot exceed 30 characters");
    } else {
      setErrorGroup("");
    }
  };

  // ✅ validate Title
  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);

    if (!value.trim()) {
      setErrorTitle("You have not entered a Title");
    } else if (value.length > 30) {
      setErrorTitle("Title cannot exceed 30 characters");
    } else {
      setErrorTitle("");
    }
  };

  // ✅ validate Description
  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescription(value);

    if (!value.trim()) {
      setErrorDescription("You have not entered a Description");
    } else if (value.length > 255) {
      setErrorDescription("Description cannot exceed 255 characters");
    } else {
      setErrorDescription("");
    }
  };

  // ✅ submit khi không nhập gì cả
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Re-run validate để hiển thị lỗi khi bấm submit mà chưa nhập
    handleFullNameChange({ target: { value: fullName } });
    handlePhoneChange({ target: { value: phoneNumber } });
    handleGroupChange({ target: { value: groupName } });
    handleTitleChange({ target: { value: title } });
    handleDescriptionChange({ target: { value: description } });

    if (
      errorFullName ||
      errorPhone ||
      errorGroup ||
      errorTitle ||
      errorDescription ||
      !fullName ||
      !phoneNumber ||
      !groupName ||
      !title ||
      !description
    ) {
      return;
    }

    try {
      const res = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phoneNumber,
          groupName,
          title,
          description,
          approvalFlow,
        }),
      });

      if (res.ok) {
        alert("Project created successfully!");
        setFullName("");
        setPhoneNumber("");
        setGroupName("");
        setTitle("");
        setDescription("");
        setApprovalFlow("mentor");
      } else {
        alert("Failed to create project!");
      }
    } catch (error) {
      console.error(error);
      alert("Error connecting to server!");
    }
  };

  return (
    <>
      <div className="w-full flex h-screen bg-[#E8E8E8] overflow-hidden">
        {/* menu left */}
        <div className="w-[17%] h-full">
          <StudentMenu />
        </div>

        {/* right content */}
        <div className="w-[83%] flex flex-col overflow-y-auto h-full">
          <HeaderStudent />

          <div className="w-[95%] mx-auto flex-1 rounded-2xl mt-[20px] p-6 bg-white">
            <div className="flex justify-center">
              <h1 className="text-xl font-bold mb-6">
                Register new research projects
              </h1>
            </div>

            <form
              onSubmit={handleSubmit}
              className="w-[90%] flex flex-col gap-[5px] ml-[50px] mx-auto space-y-4"
            >
              {/* Full Name */}
              <div className="flex flex-col gap-[5px]">
                <p className="text-[16px] font-bold">Full Name:</p>
                <input
                  value={fullName}
                  onChange={handleFullNameChange}
                  className={`h-[32px] outline-none  rounded-[20px] border px-4 mt-1 w-[600px] ${
                    errorFullName
                      ? "border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-gray-300 focus:ring-1 focus:ring-blue-500"
                  }`}
                  type="text"
                />
                {errorFullName && (
                  <p className="text-red-500 text-sm mt-1">{errorFullName}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-[5px]">
                {/* ui phần lỗi sđt  */}
                <p className="text-[16px] font-bold">Phone number:</p>
                <input
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className={`h-[32px] rounded-[20px] outline-none border px-4 mt-1 w-[600px] ${
                    errorPhone
                      ? "border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-gray-300 focus:ring-1 focus:ring-blue-500"
                  }`}
                  type="text"
                />
                {errorPhone && (
                  <p className="text-red-500 text-sm mt-1">{errorPhone}</p>
                )}
              </div>

              {/* Group Name */}
              <div className="flex flex-col gap-[5px]">
                <p className="text-[16px] font-bold">Group Name:</p>
                <input
                  value={groupName}
                  onChange={handleGroupChange}
                  className={`h-[32px] outline-none rounded-[20px] border px-4 mt-1 w-[600px] ${
                    errorGroup
                      ? "border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-gray-300 focus:ring-1 focus:ring-blue-500"
                  }`}
                  type="text"
                />
                {errorGroup && (
                  <p className="text-red-500 text-sm mt-1">{errorGroup}</p>
                )}
              </div>

              {/* Title */}
              <div className="flex flex-col gap-[5px]">
                <p className="text-[16px] font-bold">Title:</p>
                <input
                  value={title}
                  onChange={handleTitleChange}
                  className={`h-[32px] outline-none rounded-[20px] border px-4 mt-1 w-[600px] ${
                    errorTitle
                      ? "border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-gray-300 focus:ring-1 focus:ring-blue-500"
                  }`}
                  type="text"
                />
                {errorTitle && (
                  <p className="text-red-500 text-sm mt-1">{errorTitle}</p>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-[5px]">
                <p className="text-[16px] font-bold">Description:</p>
                <textarea
                  value={description}
                  onChange={handleDescriptionChange}
                  className={`h-[200px] outline-none rounded-[10px] border px-4 py-2 mt-1 w-[600px] ${
                    errorDescription
                      ? "border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-gray-300 focus:ring-1 focus:ring-blue-500"
                  }`}
                />
                {errorDescription && (
                  <p className="text-red-500 text-sm mt-1">
                    {errorDescription}
                  </p>
                )}
              </div>

              {/* Approval Flow */}
              <div className="flex flex-col gap-[5px]">
                <p className="text-[16px] font-bold mb-1">Approval Flow:</p>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-[16px]">
                    <input
                      type="radio"
                      name="approval"
                      value="mentor"
                      checked={approvalFlow === "mentor"}
                      onChange={() => setApprovalFlow("mentor")}
                      className="w-5 h-5 accent-blue-500"
                    />
                    Mentor
                  </label>

                  <label className="flex items-center gap-2 text-[16px]">
                    <input
                      type="radio"
                      name="approval"
                      value="council"
                      checked={approvalFlow === "council"}
                      onChange={() => setApprovalFlow("council")}
                      className="w-5 h-5 accent-blue-500"
                    />
                    Council
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  className="px-6 mt-[20px] py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition w-[450px]"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
