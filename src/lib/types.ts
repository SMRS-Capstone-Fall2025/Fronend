import { type LucideIcon } from "lucide-react";

export type Role =
  | "student"
  | "instructor"
  | "mentor"
  | "staff"
  | "admin"
  | "dean";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
}

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  group?: string;
}

export interface Instructor {
  id: string;
  name: string;
  experience: number;
  rating: number;
  imageId: string;
}

export interface Review {
  id: string;
  name: string;
  comment: string;
}

export interface InstructorStudent {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  nextLesson: string;
  status: "active" | "completed" | "on-hold";
  startDate: string;
  notes?: string;
  avatar?: string;
}
