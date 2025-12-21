import type { Instructor, Review, User } from "./types";
import type { CourseDto } from "@/services/types";
import { placeholderImages } from "./placeholder-images.json";

const getPlaceholderImageUrl = (id: string): string => {
  const image = placeholderImages.find((item) => item.id === id);
  return image?.imageUrl ?? "";
};

export const courses: CourseDto[] = [
  {
    id: 1,
    name: "Bằng Lái B1",
    description: "Khóa học lái xe số tự động",
    price: 12000000,
    durationDays: 30,
    imageUrl: getPlaceholderImageUrl("course-b1"),
    sections: [
      { id: 1, title: "15 giờ học thực hành" },
      { id: 2, title: "Học 1-1 với giảng viên" },
      { id: 3, title: "Thi thử không giới hạn" },
    ],
  },
  {
    id: 2,
    name: "Bằng Lái B2",
    description: "Khóa học lái xe số sàn",
    price: 14000000,
    durationDays: 35,
    imageUrl: getPlaceholderImageUrl("course-b2"),
    sections: [
      { id: 1, title: "20 giờ học thực hành" },
      { id: 2, title: "Học 1-1 với giảng viên" },
      { id: 3, title: "Bao gồm lệ phí thi" },
    ],
  },
  {
    id: 3,
    name: "Bằng Lái Hạng C",
    description: "Khóa học lái xe tải",
    price: 20000000,
    durationDays: 45,
    imageUrl: getPlaceholderImageUrl("course-c"),
    sections: [
      { id: 1, title: "30 giờ học thực hành" },
      { id: 2, title: "Thực hành trên xe tải đời mới" },
      { id: 3, title: "Hỗ trợ hồ sơ chuyên nghiệp" },
    ],
  },
];

export const instructors: Instructor[] = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    experience: 10,
    rating: 5,
    imageId: "instructor-1",
  },
  {
    id: "2",
    name: "Trần Thị B",
    experience: 8,
    rating: 4,
    imageId: "instructor-2",
  },
  {
    id: "3",
    name: "Lê Văn C",
    experience: 12,
    rating: 5,
    imageId: "instructor-3",
  },
  {
    id: "4",
    name: "Phạm Thị D",
    experience: 5,
    rating: 4,
    imageId: "instructor-4",
  },
];

export const reviews: Review[] = [
  {
    id: "1",
    name: "Anh Khoa",
    comment:
      "Giảng viên rất nhiệt tình, xe tập mới và sạch sẽ. Tôi đã thi đỗ ngay lần đầu!",
  },
  {
    id: "2",
    name: "Chị Mai",
    comment:
      "Trung tâm hỗ trợ làm hồ sơ rất nhanh. Lịch học linh hoạt, phù hợp với người đi làm.",
  },
  {
    id: "3",
    name: "Chú Hùng",
    comment:
      "Rất hài lòng với chất lượng dịch vụ. Sẽ giới thiệu cho bạn bè và người thân.",
  },
];

export const mockUsers: Record<string, User> = {
  student: {
    id: "user-student",
    name: "Văn Học Viên",
    email: "student@example.com",
    avatar: null,
    role: "student",
  },
  instructor: {
    id: "user-instructor",
    name: "Thanh Giảng Viên",
    email: "instructor@example.com",
    avatar: null,
    role: "instructor",
  },
  mentor: {
    id: "user-mentor",
    name: "Hữu Cố Vấn",
    email: "mentor@example.com",
    avatar: null,
    role: "mentor",
  },
  staff: {
    id: "user-staff",
    name: "Tú Nhân Viên",
    email: "staff@example.com",
    avatar: null,
    role: "staff",
  },
  admin: {
    id: "user-admin",
    name: "Quang Quản Trị",
    email: "admin@example.com",
    avatar: null,
    role: "admin",
  },
  dean: {
    id: "user-dean",
    name: "Linh Trưởng Bộ Môn",
    email: "dean@example.com",
    avatar: null,
    role: "dean",
  },
};

export const notifications = [];

export const studentProgress = {
  totalLessons: 20,
  completedLessons: 12,
  totalKm: 500,
  drivenKm: 280,
  skills: [
    { name: "Khởi hành ngang dốc", status: "completed" },
    { name: "Lùi chuồng", status: "in-progress" },
    { name: "Đi trong sa hình", status: "pending" },
  ],
  examResult: null,
};

export const instructorStudents = [
  {
    id: "sv1",
    name: "Nguyễn Văn An",
    course: "B2",
    progress: 80,
    nextLesson: "Ngày mai, 9:00",
  },
  {
    id: "sv2",
    name: "Trần Thị Bình",
    course: "B1",
    progress: 50,
    nextLesson: "Ngày mai, 14:00",
  },
  {
    id: "sv3",
    name: "Lê Văn Cường",
    course: "B2",
    progress: 65,
    nextLesson: "Ngày kia, 8:00",
  },
];

export const instructorAvailability = [
  {
    id: "t1",
    date: "2024-08-01",
    time: "08:00 - 10:00",
    status: "booked",
    student: "Nguyễn Văn An",
  },
  {
    id: "t2",
    date: "2024-08-01",
    time: "10:00 - 12:00",
    status: "available",
    student: null,
  },
  {
    id: "t3",
    date: "2024-08-01",
    time: "14:00 - 16:00",
    status: "booked",
    student: "Trần Thị Bình",
  },
  {
    id: "t4",
    date: "2024-08-02",
    time: "09:00 - 11:00",
    status: "available",
    student: null,
  },
];

export const financialReportData = [
  { month: "Jan", revenue: 80000000, expenses: 50000000 },
  { month: "Feb", revenue: 95000000, expenses: 55000000 },
  { month: "Mar", revenue: 110000000, expenses: 60000000 },
  { month: "Apr", revenue: 105000000, expenses: 62000000 },
  { month: "May", revenue: 120000000, expenses: 65000000 },
  { month: "Jun", revenue: 135000000, expenses: 70000000 },
];

export const studentSchedule = [
  {
    id: "l1",
    date: "2024-08-05",
    time: "09:00 - 11:00",
    instructor: "Nguyễn Văn A",
    status: "upcoming",
  },
  {
    id: "l2",
    date: "2024-08-07",
    time: "14:00 - 16:00",
    instructor: "Trần Thị B",
    status: "upcoming",
  },
  {
    id: "l3",
    date: "2024-07-29",
    time: "08:00 - 10:00",
    instructor: "Nguyễn Văn A",
    status: "completed",
  },
  {
    id: "l4",
    date: "2024-08-10",
    time: "09:00 - 11:00",
    instructor: "Lê Văn C",
    status: "upcoming",
  },
  {
    id: "l5",
    date: "2024-08-05",
    time: "14:00 - 16:00",
    instructor: "Nguyễn Văn A",
    status: "upcoming",
  },
  {
    id: "l6",
    date: "2024-07-25",
    time: "14:00 - 16:00",
    instructor: "Trần Thị B",
    status: "completed",
  },
  {
    id: "l7",
    date: "2024-08-01",
    time: "10:00 - 12:00",
    instructor: "Trần Thị B",
    status: "cancelled",
  },
];
