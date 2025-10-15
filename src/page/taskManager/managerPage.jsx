import React, { useState } from "react";
import ManagerMenu from "../../component/managerMenu";
import HeaderManager from "../../component/headerManager.jsx";

export default function ManagerPage() {
  const [task, setTask] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("open");
  const [priority, setPriority] = useState("medium");
  const [assignee, setAssignee] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    //phần xử lý
  };

  return (
    <>
      <div className="w-full flex h-screen bg-[#E8E8E8] overflow-hidden">
        {/* Menu trái */}
        <div className="w-[20%] h-full">
          <ManagerMenu />
        </div>

        {/* Nội dung phải */}
        <div className="w-[80%] flex flex-col h-full">
          <HeaderManager />

          <div className="flex-1 flex justify-center items-start p-6 overflow-hidden">
            <div className="w-[95%] rounded-2xl bg-white p-8 shadow-md">
              <div className="flex justify-center">
                <h1 className="text-xl font-bold mb-6">Create new task</h1>
              </div>

              <form
                onSubmit={handleSubmit}
                className="w-[90%] flex flex-col gap-5 mx-auto"
              >
                {/* Task */}
                <div className="flex flex-col">
                  <label className="font-bold text-[16px] mb-1">Task:</label>
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="[Task]"
                    className="h-[32px] w-[300px] px-4 rounded-[20px] border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Title */}
                <div className="flex flex-col">
                  <label className="font-bold text-[16px] mb-1">Title:</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="[Title]"
                    className="h-[32px] w-[600px] px-4 rounded-[20px] border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col">
                  <label className="font-bold text-[16px] mb-1">
                    Description:
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-[600px] h-[120px] px-4 py-2 rounded-[15px] border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>

                {/*  Status + Assignee */}
                <div className="flex gap-8">
                  <div className="flex flex-col">
                    <label className="font-bold text-[16px] mb-1">
                      Status:
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="h-[32px] w-[200px] px-4 rounded-[20px] border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value="open">open</option>
                      <option value="inprogress">in progress</option>
                      <option value="done">done</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="font-bold text-[16px] mb-1">
                      Assignee:
                    </label>
                    <select
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                      className="h-[32px] w-[250px] px-4 rounded-[20px] border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value="">-- Select --</option>
                      <option value="A">Nguyen Van A</option>
                      <option value="B">Tran Thi B</option>
                    </select>
                  </div>
                </div>

                {/* Priority + Specialty */}
                <div className="flex gap-8">
                  <div className="flex flex-col">
                    <label className="font-bold text-[16px] mb-1">
                      Priority:
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="h-[32px] w-[200px] px-4 rounded-[20px] border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value="low">low</option>
                      <option value="medium">medium</option>
                      <option value="high">high</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="font-bold text-[16px] mb-1">
                      Specialty:
                    </label>
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="h-[32px] w-[250px] px-4 rounded-[20px] border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value="">-- Select --</option>
                      <option value="AI">Artificial Intelligence</option>
                      <option value="ML">Machine Learning</option>
                      <option value="SE">Software Engineering</option>
                    </select>
                  </div>
                </div>

                {/*  Start+End */}
                <div className="flex gap-8">
                  <div className="flex flex-col">
                    <label className="font-bold text-[16px] mb-1">
                      Start-date:
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-[32px] w-[200px] px-4 rounded-[20px] border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="font-bold text-[16px] mb-1">
                      End day:
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-[32px] w-[200px] px-4 rounded-[20px] border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-center mt-6">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition w-[400px]"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
