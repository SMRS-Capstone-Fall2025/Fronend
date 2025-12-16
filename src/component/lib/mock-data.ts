export type Student = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  enrolled?: boolean;
};

export type Instructor = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  active?: boolean;
};

export const mockStudents: Student[] = [
  {
    id: "s1",
    name: "Nguyễn Văn A",
    email: "a@example.com",
    phone: "0900000001",
    enrolled: true,
  },
  {
    id: "s2",
    name: "Trần Thị B",
    email: "b@example.com",
    phone: "0900000002",
    enrolled: false,
  },
  {
    id: "s3",
    name: "Lê Văn C",
    email: "c@example.com",
    phone: "0900000003",
    enrolled: true,
  },
];

export const mockInstructors: Instructor[] = [
  {
    id: "i1",
    name: "Huỳnh Thị D",
    email: "d@example.com",
    phone: "0910000001",
    active: true,
  },
  {
    id: "i2",
    name: "Phạm Văn E",
    email: "e@example.com",
    phone: "0910000002",
    active: true,
  },
];

export type Registration = {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  registerDate: string; // ISO date
  notes?: string;
  assignedInstructorId?: string;
};

export const mockRegistrations: Registration[] = [
  {
    id: "r1",
    studentId: "s1",
    studentName: "Nguyễn Văn A",
    courseId: "c1",
    courseName: "Lái xe cơ bản",
    registerDate: new Date().toISOString(),
    notes: "Ưu tiên buổi tối",
    assignedInstructorId: undefined,
  },
  {
    id: "r2",
    studentId: "s2",
    studentName: "Trần Thị B",
    courseId: "c2",
    courseName: "Lý thuyết nâng cao",
    registerDate: new Date().toISOString(),
    notes: "Không có",
    assignedInstructorId: "i1",
  },
];
