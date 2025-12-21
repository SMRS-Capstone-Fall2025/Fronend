import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const vndFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export function formatVndCurrency(value: number | null | undefined): string {
  const amount = typeof value === "number" ? value : 0;
  return vndFormatter.format(amount);
}

export function getErrorMessage(
  error: unknown,
  fallback = "Đã có lỗi xảy ra"
): string {
  console.error("Error occurred:", error);

  if (typeof error === "string") {
    return error;
  }

  // Handle Axios error with response
  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosError = error as {
      response?: {
        data?: {
          message?: string;
          error?: string;
          success?: boolean;
        };
      };
      message?: string;
    };

    if (axiosError.response?.data) {
      console.error("API Error Response:", axiosError.response.data);

      // Priority: message > error > axiosError.message
      if (axiosError.response.data.message) {
        return axiosError.response.data.message;
      }
      if (axiosError.response.data.error) {
        return axiosError.response.data.error;
      }
    }

    if (axiosError.message) {
      return axiosError.message;
    }
  }

  // Handle direct error object with {error, message} format
  if (typeof error === "object" && error !== null) {
    const errorObj = error as {
      message?: unknown;
      error?: unknown;
    };

    if (typeof errorObj.message === "string" && errorObj.message) {
      return errorObj.message;
    }
    if (typeof errorObj.error === "string" && errorObj.error) {
      return errorObj.error;
    }
  }

  return fallback;
}

export function getDefaultRouteByRole(role: string | null | undefined): string {
  if (!role) return "/login";

  const normalizedRole = normalizeRole(role);

  const normalized = normalizedRole ?? String(role).toLowerCase();

  const roleMap: Record<string, string> = {
    student: "/student/projects",
    instructor: "/instructor/dashboard",
    lecturer: "/mentor/projects",
    mentor: "/mentor/projects",
    staff: "/staff/dashboard",
    admin: "/admin/dashboard",
    dean: "/dean/dashboard",
  };

  return roleMap[normalized] ?? "/login";
}

export function getExpectedRoleFromPath(pathname: string): string | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/dean")) return "dean";
  if (pathname.startsWith("/mentor")) return "mentor";
  if (pathname.startsWith("/student")) return "student";
  if (pathname.startsWith("/staff")) return "staff";
  if (pathname.startsWith("/instructor")) return "instructor";
  return null;
}

export function normalizeRole(role: string | null | undefined): string | null {
  if (!role) return null;

  const normalized = String(role).toLowerCase();
  const roleMap: Record<string, string> = {
    student: "student",
    instructor: "instructor",
    lecturer: "mentor",
    mentor: "mentor",
    staff: "staff",
    admin: "admin",
    dean: "dean",
  };

  return roleMap[normalized] ?? null;
}

export function isRoleAllowed(
  userRole: string | null | undefined,
  pathname: string
): boolean {
  const expectedRole = getExpectedRoleFromPath(pathname);
  if (!expectedRole) return true;

  const normalizedUserRole = normalizeRole(userRole);
  if (!normalizedUserRole) return false;

  return normalizedUserRole === expectedRole;
}
