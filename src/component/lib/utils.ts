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
