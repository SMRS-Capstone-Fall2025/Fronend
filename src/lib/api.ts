

import type { Role, User, InstructorStudent } from "./types";
import type { CourseCreateRequest, CourseDto } from "@/services/types";

export interface CourseRegistrationData {
  courseId: string;
  courseName: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
  notes?: string;
  registeredAt: string;
}

export interface UserRegistrationData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  dateOfBirth?: string;
  address?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export async function registerForCourse(
  data: CourseRegistrationData
): Promise<
  ApiResponse<{
    registrationId: string;
    registrationData: CourseRegistrationData;
  }>
> {

  await new Promise((resolve) => setTimeout(resolve, 1500));

  console.log("📝 Course Registration Request:", data);

  const isSuccess = Math.random() > 0.1;

  if (isSuccess) {
    const registrationId = `REG-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 11)}`;

    console.log("✅ Registration successful:", { registrationId });

    return {
      success: true,
      data: {
        registrationId,
        registrationData: data,
      },
      message: "Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm.",
    };
  } else {
    console.log("❌ Registration failed");

    return {
      success: false,
      error: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
    };
  }
}

export async function getRegistrations(): Promise<
  ApiResponse<CourseRegistrationData[]>
> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const mockRegistrations: CourseRegistrationData[] = [
    {
      courseId: "b1",
      courseName: "Bằng Lái B1",
      fullName: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      phone: "0912345678",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      dateOfBirth: "1990-01-15",
      notes: "Muốn học vào buổi sáng",
      registeredAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      courseId: "b2",
      courseName: "Bằng Lái B2",
      fullName: "Trần Thị B",
      email: "tranthib@example.com",
      phone: "0987654321",
      address: "456 Đường XYZ, Quận 3, TP.HCM",
      registeredAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  return {
    success: true,
    data: mockRegistrations,
    message: "Lấy danh sách đăng ký thành công",
  };
}

export async function registerUser(
  data: UserRegistrationData
): Promise<
  ApiResponse<{
    userId: string;
    userData: Omit<UserRegistrationData, "password">;
  }>
> {

  await new Promise((resolve) => setTimeout(resolve, 1500));

  console.log("👤 User Registration Request:", { ...data, password: "***" });

  const emailExists = Math.random() < 0.1;
  if (emailExists) {
    console.log("❌ Email already exists");
    return {
      success: false,
      error:
        "Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.",
    };
  }

  const isSuccess = Math.random() > 0.05;

  if (isSuccess) {
    const userId = `USER-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 11)}`;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userDataWithoutPassword } = data;

    console.log("✅ User registration successful:", { userId });

    return {
      success: true,
      data: {
        userId,
        userData: userDataWithoutPassword,
      },
      message:
        "Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.",
    };
  } else {
    console.log("❌ User registration failed");

    return {
      success: false,
      error: "Đã có lỗi xảy ra khi tạo tài khoản. Vui lòng thử lại sau.",
    };
  }
}

export async function createCourse(
  data: CourseCreateRequest
): Promise<ApiResponse<CourseDto>> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("📚 Create Course Request:", data);

  const isSuccess = Math.random() > 0.05;

  if (isSuccess) {
    const courseId = Date.now();
    const newCourse: CourseDto = {
      id: courseId,
      name: data.name,
      description: data.description,
      price: data.price,
      durationDays: data.durationDays ?? null,
      imageUrl: data.imageUrl ?? null,
      sections:
        data.sections?.map((section, index) => ({
          id: index + 1,
          title: section.title,
          description: section.description ?? null,
        })) ?? [],
    };

    console.log("✅ Course created:", { courseId });

    return {
      success: true,
      data: newCourse,
      message: "Khóa học đã được tạo thành công.",
    };
  } else {
    console.log("❌ Course creation failed");

    return {
      success: false,
      error: "Đã có lỗi xảy ra khi tạo khóa học. Vui lòng thử lại sau.",
    };
  }
}

export async function updateCourse(
  courseId: number,
  data: CourseCreateRequest
): Promise<ApiResponse<CourseDto>> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("📝 Update Course Request:", { courseId, data });

  const isSuccess = Math.random() > 0.05;

  if (isSuccess) {
    const updatedCourse: CourseDto = {
      id: courseId,
      name: data.name,
      description: data.description,
      price: data.price,
      durationDays: data.durationDays ?? null,
      imageUrl: data.imageUrl ?? null,
      sections:
        data.sections?.map((section, index) => ({
          id: index + 1,
          title: section.title,
          description: section.description ?? null,
        })) ?? [],
    };

    console.log("✅ Course updated:", { courseId });

    return {
      success: true,
      data: updatedCourse,
      message: "Khóa học đã được cập nhật thành công.",
    };
  } else {
    console.log("❌ Course update failed");

    return {
      success: false,
      error: "Đã có lỗi xảy ra khi cập nhật khóa học. Vui lòng thử lại sau.",
    };
  }
}

export async function deleteCourse(
  courseId: number
): Promise<ApiResponse<null>> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  console.log("🗑️ Delete Course Request:", { courseId });

  const isSuccess = Math.random() > 0.05;

  if (isSuccess) {
    console.log("✅ Course deleted:", { courseId });

    return {
      success: true,
      message: "Khóa học đã được xóa thành công.",
    };
  } else {
    console.log("❌ Course deletion failed");

    return {
      success: false,
      error: "Đã có lỗi xảy ra khi xóa khóa học. Vui lòng thử lại sau.",
    };
  }
}

export async function createUser(data: {
  name: string;
  email: string;
  role: Role;
  avatar: string;
  password: string;
}): Promise<ApiResponse<User>> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("👤 Create User Request:", { ...data, password: "***" });

  const emailExists = Math.random() < 0.05;
  if (emailExists) {
    console.log("❌ Email already exists");
    return {
      success: false,
      error: "Email này đã tồn tại trong hệ thống.",
    };
  }

  const isSuccess = Math.random() > 0.05;

  if (isSuccess) {
    const userId = `user-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 11)}`;
    const newUser: User = {
      id: userId,
      name: data.name,
      email: data.email,
      role: data.role,
      avatar: data.avatar,
    };

    console.log("✅ User created:", { userId });

    return {
      success: true,
      data: newUser,
      message: "Người dùng đã được tạo thành công.",
    };
  } else {
    console.log("❌ User creation failed");

    return {
      success: false,
      error: "Đã có lỗi xảy ra khi tạo người dùng. Vui lòng thử lại sau.",
    };
  }
}

export async function updateUser(
  userId: string,
  data: { name: string; email: string; role: Role; avatar: string }
): Promise<ApiResponse<User>> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("📝 Update User Request:", { userId, data });

  const isSuccess = Math.random() > 0.05;

  if (isSuccess) {
    const updatedUser: User = {
      id: userId,
      ...data,
    };

    console.log("✅ User updated:", { userId });

    return {
      success: true,
      data: updatedUser,
      message: "Thông tin người dùng đã được cập nhật thành công.",
    };
  } else {
    console.log("❌ User update failed");

    return {
      success: false,
      error:
        "Đã có lỗi xảy ra khi cập nhật thông tin người dùng. Vui lòng thử lại sau.",
    };
  }
}

export async function deleteUser(userId: string): Promise<ApiResponse<null>> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  console.log("🗑️ Delete User Request:", { userId });

  const isSuccess = Math.random() > 0.05;

  if (isSuccess) {
    console.log("✅ User deleted:", { userId });

    return {
      success: true,
      message: "Người dùng đã được xóa thành công.",
    };
  } else {
    console.log("❌ User deletion failed");

    return {
      success: false,
      error: "Đã có lỗi xảy ra khi xóa người dùng. Vui lòng thử lại sau.",
    };
  }
}

export async function getInstructorStudents(): Promise<
  ApiResponse<InstructorStudent[]>
> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  console.log("👨‍🎓 Get Instructor Students Request");

  const isSuccess = Math.random() > 0.05;

  if (isSuccess) {

    const mockStudents: InstructorStudent[] = [
      {
        id: "sv1",
        name: "Nguyễn Văn An",
        email: "nguyenvanan@example.com",
        phone: "0912345678",
        course: "Bằng Lái B2",
        progress: 80,
        completedLessons: 16,
        totalLessons: 20,
        nextLesson: "Ngày mai, 9:00 - 11:00",
        status: "active",
        startDate: "2024-01-15",
        notes: "Học viên tiến bộ tốt, cần luyện thêm kỹ năng đỗ xe.",
        avatar: "https://i.pravatar.cc/150?u=sv1",
      },
      {
        id: "sv2",
        name: "Trần Thị Bình",
        email: "tranthib@example.com",
        phone: "0987654321",
        course: "Bằng Lái B1",
        progress: 50,
        completedLessons: 8,
        totalLessons: 15,
        nextLesson: "Ngày mai, 14:00 - 16:00",
        status: "active",
        startDate: "2024-02-01",
        avatar: "https://i.pravatar.cc/150?u=sv2",
      },
    ];

    console.log("✅ Students retrieved:", { count: mockStudents.length });

    return {
      success: true,
      data: mockStudents,
      message: "Lấy danh sách học viên thành công",
    };
  } else {
    console.log("❌ Get students failed");

    return {
      success: false,
      error:
        "Đã có lỗi xảy ra khi tải danh sách học viên. Vui lòng thử lại sau.",
    };
  }
}

export async function updateStudentNotes(
  studentId: string,
  notes: string
): Promise<ApiResponse<{ studentId: string; notes: string }>> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("📝 Update Student Notes Request:", {
    studentId,
    notesLength: notes.length,
  });

  const isSuccess = Math.random() > 0.05;

  if (isSuccess) {
    console.log("✅ Student notes updated:", { studentId });

    return {
      success: true,
      data: {
        studentId,
        notes,
      },
      message: "Ghi chú đã được cập nhật thành công.",
    };
  } else {
    console.log("❌ Update student notes failed");

    return {
      success: false,
      error: "Đã có lỗi xảy ra khi cập nhật ghi chú. Vui lòng thử lại sau.",
    };
  }
}

export async function updateStudentStatus(
  studentId: string,
  status: "active" | "completed" | "on-hold"
): Promise<ApiResponse<{ studentId: string; status: string }>> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  console.log("🔄 Update Student Status Request:", { studentId, status });

  const isSuccess = Math.random() > 0.05;

  if (isSuccess) {
    console.log("✅ Student status updated:", { studentId, status });

    return {
      success: true,
      data: {
        studentId,
        status,
      },
      message: "Trạng thái học viên đã được cập nhật.",
    };
  } else {
    console.log("❌ Update student status failed");

    return {
      success: false,
      error: "Đã có lỗi xảy ra khi cập nhật trạng thái. Vui lòng thử lại sau.",
    };
  }
}
