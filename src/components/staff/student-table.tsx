import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Student } from "@/lib/mock-data";

const LOADING_ROW_KEYS = ["first", "second", "third"] as const;

type Props = {
  readonly students: Student[];
  readonly isLoading?: boolean;
};

export default function StudentTable({ students, isLoading }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q)
    );
  }, [students, query]);

  const renderRows = () => {
    if (isLoading) {
      return LOADING_ROW_KEYS.map((key) => (
        <TableRow key={`student-loading-${key}`}>
          <TableCell>
            <Skeleton className="h-4 w-36" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-48" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="h-9 w-9" />
          </TableCell>
        </TableRow>
      ));
    }

    if (filtered.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={3} className="py-12">
            <div className="text-center text-sm text-muted-foreground">
              Chưa có học viên nào.
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return filtered.map((s) => (
      <TableRow key={s.id}>
        <TableCell className="font-medium">{s.name}</TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {s.email || "—"}
        </TableCell>
        <TableCell className="text-right">—</TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="space-y-3">
      <div>
        <Input
          placeholder="Tìm kiếm học viên"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{renderRows()}</TableBody>
      </Table>
    </div>
  );
}
