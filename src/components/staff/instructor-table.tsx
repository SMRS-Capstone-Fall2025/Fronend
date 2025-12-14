import { Button } from "@/components/ui/button";
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
import type { Instructor } from "@/lib/mock-data";
import { Pencil, Trash2 } from "lucide-react";

const LOADING_ROW_KEYS = ["first", "second", "third"] as const;

type Props = {
  readonly instructors: Instructor[];
  readonly isLoading?: boolean;
  readonly onEdit?: (i: Instructor) => void;
  readonly onDelete?: (id: string) => void;
};

export default function InstructorTable({
  instructors,
  isLoading,
  onEdit,
  onDelete,
}: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return instructors;
    return instructors.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.email || "").toLowerCase().includes(q)
    );
  }, [instructors, query]);

  const renderRows = () => {
    if (isLoading) {
      return LOADING_ROW_KEYS.map((key) => (
        <TableRow key={`instructor-loading-${key}`}>
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
              Chưa có giảng viên nào.
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return filtered.map((i) => (
      <TableRow key={i.id}>
        <TableCell className="font-medium">{i.name}</TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {i.email || "—"}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit?.(i)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(i.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="space-y-3">
      <div>
        <Input
          placeholder="Tìm kiếm giảng viên"
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
