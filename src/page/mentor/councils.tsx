import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TablePagination } from "@/components/ui/table-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useMyCouncilsQuery } from "@/services/council/hooks";
import type { CouncilDto } from "@/services/types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Mail,
  Search,
  Users,
  Users2,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import MentorLayout from "./layout";

export default function MentorCouncils() {
  const { data: councils = [], isLoading } = useMyCouncilsQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedCouncil, setSelectedCouncil] = useState<CouncilDto | null>(
    null
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const pagination = usePagination({ initialPage: 1, initialPageSize: 5 });

  const filteredCouncils = useMemo(() => {
    const search = debouncedSearch?.trim() || "";
    if (!search) return councils;
    const keyword = search.toLowerCase();
    return councils.filter((council) => {
      const sources = [
        council.councilCode?.toLowerCase(),
        council.councilName?.toLowerCase(),
        council.department?.toLowerCase(),
      ];
      return sources.some((value) => value?.includes(keyword));
    });
  }, [councils, debouncedSearch]);

  const paginatedCouncils = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredCouncils.slice(start, end);
  }, [filteredCouncils, pagination.page, pagination.pageSize]);

  useEffect(() => {
    pagination.setTotalItems(filteredCouncils.length);
  }, [filteredCouncils.length]);

  useEffect(() => {
    pagination.setPage(1);
  }, [debouncedSearch]);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return "—";
    }
  };

  const getStatusBadge = (status: string | null | undefined) => {
    if (!status) {
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Chưa xác định
        </Badge>
      );
    }

    const statusLower = status.toLowerCase();
    if (statusLower === "active") {
      return (
        <Badge className="bg-green-500 text-white">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Hoạt động
        </Badge>
      );
    }
    if (statusLower === "pending") {
      return (
        <Badge className="bg-blue-500 text-white">
          <Clock className="h-3 w-3 mr-1" />
          Chờ duyệt
        </Badge>
      );
    }
    if (statusLower === "inactive" || statusLower === "archived") {
      return (
        <Badge className="bg-gray-500 text-white">
          <XCircle className="h-3 w-3 mr-1" />
          Không hoạt động
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="text-muted-foreground">
        {status}
      </Badge>
    );
  };

  const handleViewDetails = (council: CouncilDto) => {
    setSelectedCouncil(council);
    setDetailOpen(true);
  };

  const columns: DataTableColumn<CouncilDto>[] = useMemo(
    () => [
      {
        id: "index",
        header: "#",
        headerClassName: "text-center",
        className: "text-center w-16",
        render: (_, index) => {
          const globalIndex =
            (pagination.page - 1) * pagination.pageSize + index + 1;
          return <span className="text-muted-foreground">{globalIndex}</span>;
        },
      },
      {
        id: "code",
        header: "Mã hội đồng",
        render: (council) => (
          <span className="font-medium">{council.councilCode || "—"}</span>
        ),
      },
      {
        id: "name",
        header: "Tên hội đồng",
        render: (council) => (
          <div className="max-w-xs">
            <div className="font-medium" title={council.councilName ?? ""}>
              {council.councilName || "—"}
            </div>
          </div>
        ),
      },
      {
        id: "department",
        header: "Khoa/Bộ môn",
        render: (council) => <span>{council.department || "—"}</span>,
      },
      {
        id: "members",
        header: "Thành viên",
        render: (council) => (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{council.members.length} người</span>
          </div>
        ),
      },
      {
        id: "status",
        header: "Trạng thái",
        render: (council) => getStatusBadge(council.status),
      },
      {
        id: "createdAt",
        header: "Ngày tạo",
        render: (council) => (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {formatDate(council.createdAt)}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Thao tác",
        headerClassName: "text-right",
        className: "text-right",
        render: (council) => (
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(council);
            }}
            className="h-9 w-9"
            title="Xem chi tiết"
          >
            <Eye className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [pagination.page, pagination.pageSize]
  );

  return (
    <MentorLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Users2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Hội đồng của tôi
              </h1>
              <p className="text-sm text-muted-foreground">
                Xem danh sách các hội đồng mà bạn là thành viên
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => {
                  const value = event.target.value;
                  setSearchTerm(value);
                }}
                className="pl-9"
                placeholder="Tìm kiếm theo mã, tên hoặc khoa/bộ môn..."
              />
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={paginatedCouncils}
          isLoading={isLoading}
          emptyMessage={
            searchTerm.trim()
              ? "Không tìm thấy hội đồng phù hợp"
              : "Bạn chưa tham gia hội đồng nào"
          }
          emptyIcon={
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          }
          keyExtractor={(council) => council.id}
        />

        {filteredCouncils.length > 0 && (
          <div className="pt-4">
            <TablePagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalItems={filteredCouncils.length}
              totalPages={pagination.totalPages}
              startItem={pagination.startItem}
              endItem={pagination.endItem}
              hasNext={pagination.hasNext}
              hasPrevious={pagination.hasPrevious}
              isLoading={isLoading}
              onPrevious={() => pagination.previousPage()}
              onNext={() => pagination.nextPage()}
              onPageChange={(p) => pagination.setPage(p)}
              onPageSizeChange={(s) => pagination.setPageSize(s)}
            />
          </div>
        )}

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết hội đồng</DialogTitle>
              <DialogDescription>
                {selectedCouncil?.councilName &&
                  `Hội đồng: ${selectedCouncil.councilName}`}
              </DialogDescription>
            </DialogHeader>
            {selectedCouncil && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Thông tin cơ bản
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Mã hội đồng:</span>
                        <p className="text-muted-foreground mt-1">
                          {selectedCouncil.councilCode || "—"}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Tên hội đồng:</span>
                        <p className="text-muted-foreground mt-1">
                          {selectedCouncil.councilName || "—"}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Khoa/Bộ môn:</span>
                        <p className="text-muted-foreground mt-1">
                          {selectedCouncil.department || "—"}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Trạng thái:</span>
                        <div className="mt-1">
                          {getStatusBadge(selectedCouncil.status)}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Ngày tạo:
                        </span>
                        <p className="text-muted-foreground mt-1">
                          {formatDate(selectedCouncil.createdAt)}
                        </p>
                      </div>
                      {selectedCouncil.deanName && (
                        <div>
                          <span className="font-medium">Trưởng bộ môn:</span>
                          <p className="text-muted-foreground mt-1">
                            {selectedCouncil.deanName}
                            {selectedCouncil.deanEmail && (
                              <span className="text-xs text-muted-foreground block">
                                {selectedCouncil.deanEmail}
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                    {selectedCouncil.description && (
                      <div>
                        <span className="font-medium text-sm">Mô tả:</span>
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                          {selectedCouncil.description}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Thành viên hội đồng ({selectedCouncil.members.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCouncil.members.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Chưa có thành viên nào
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {selectedCouncil.members.map((member, index) => (
                          <div
                            key={member.id ?? index}
                            className="flex items-center gap-3 rounded-md border border-border/70 bg-background px-4 py-3"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                              {member.lecturerName?.charAt(0).toUpperCase() ??
                                "?"}
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <p className="font-medium">
                                {member.lecturerName || "Chưa cập nhật"}
                              </p>
                              {member.lecturerEmail && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {member.lecturerEmail}
                                </p>
                              )}
                            </div>
                            {member.role && (
                              <Badge variant="outline" className="text-xs">
                                {member.role}
                              </Badge>
                            )}
                            {member.status && (
                              <Badge
                                variant={
                                  member.status.toLowerCase() === "active"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {member.status}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setDetailOpen(false)}
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MentorLayout>
  );
}
