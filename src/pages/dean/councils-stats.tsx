import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TablePagination } from "@/components/ui/table-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useMyCouncilsStatsQuery } from "@/services/dean-stats";
import type { CouncilPerformanceDto } from "@/services/dean-stats";
import { Search, Building2, BarChart3 } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import DeanLayout from "./layout";

export default function DeanCouncilsStatsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const pagination = usePagination({ initialPage: 1, initialPageSize: 5 });

  const { data: allData = [], isLoading } = useMyCouncilsStatsQuery();

  const filteredData = useMemo(() => {
    let result = allData;

    if (debouncedSearch.trim()) {
      const keyword = debouncedSearch.trim().toLowerCase();
      result = result.filter((item) => {
        const sources = [
          item.councilName?.toLowerCase(),
          item.councilCode?.toLowerCase(),
        ];
        return sources.some((value) => value?.includes(keyword));
      });
    }

    if (sortBy) {
      result = [...result].sort((a, b) => {
        switch (sortBy) {
          case "name-asc":
            return (a.councilName ?? "").localeCompare(b.councilName ?? "");
          case "name-desc":
            return (b.councilName ?? "").localeCompare(a.councilName ?? "");
          case "projects-asc":
            return a.totalProjects - b.totalProjects;
          case "projects-desc":
            return b.totalProjects - a.totalProjects;
          case "score-asc":
            return a.averageScore - b.averageScore;
          case "score-desc":
            return b.averageScore - a.averageScore;
          default:
            return 0;
        }
      });
    }

    return result;
  }, [allData, debouncedSearch, sortBy]);

  const paginatedData = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, pagination.page, pagination.pageSize]);

  useEffect(() => {
    pagination.setTotalItems(filteredData.length);
  }, [filteredData.length, pagination]);

  useEffect(() => {
    pagination.setPage(1);
  }, [debouncedSearch, sortBy]);

  const hasActiveFilters = Boolean(searchTerm.trim() || sortBy);

  const columns: DataTableColumn<CouncilPerformanceDto>[] = useMemo(
    () => [
      {
        id: "index",
        header: "#",
        headerClassName: "text-center",
        className: "text-center w-16",
        render: (item, index) => {
          const globalIndex =
            (pagination.page - 1) * pagination.pageSize + index + 1;
          return <span className="text-muted-foreground">{globalIndex}</span>;
        },
      },
      {
        id: "councilName",
        header: "Hội đồng",
        render: (council) => (
          <div className="font-medium">{council.councilName}</div>
        ),
      },
      {
        id: "councilCode",
        header: "Mã",
        className: "text-center",
        render: (council) => (
          <Badge variant="outline">{council.councilCode}</Badge>
        ),
      },
      {
        id: "totalProjects",
        header: "Tổng dự án",
        className: "text-center",
        render: (council) => <span>{council.totalProjects}</span>,
      },
      {
        id: "completedProjects",
        header: "Đã hoàn thành",
        className: "text-center",
        render: (council) => (
          <Badge variant="secondary">{council.completedProjects}</Badge>
        ),
      },
      {
        id: "activeMembers",
        header: "Thành viên",
        className: "text-center",
        render: (council) => <span>{council.activeMembers}</span>,
      },
      {
        id: "averageScore",
        header: "Điểm TB",
        className: "text-right",
        render: (council) => (
          <span className="font-bold">
            {council.averageScore > 0 ? council.averageScore.toFixed(2) : "-"}
          </span>
        ),
      },
    ],
    [pagination.page, pagination.pageSize]
  );

  return (
    <DeanLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Hội đồng tham gia
              </h1>
              <p className="text-sm text-muted-foreground">
                Xem thống kê hiệu suất của các hội đồng bạn tham gia
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => {
                const value = event.target.value;
                setSearchTerm(value);
              }}
              className="pl-9"
              placeholder="Tìm theo tên hoặc mã hội đồng..."
            />
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger id="sort-filter" className="w-[180px]">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Tên A-Z</SelectItem>
              <SelectItem value="name-desc">Tên Z-A</SelectItem>
              <SelectItem value="projects-asc">Dự án: Tăng dần</SelectItem>
              <SelectItem value="projects-desc">Dự án: Giảm dần</SelectItem>
              <SelectItem value="score-asc">Điểm: Tăng dần</SelectItem>
              <SelectItem value="score-desc">Điểm: Giảm dần</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={paginatedData}
              isLoading={isLoading}
              emptyMessage={
                hasActiveFilters
                  ? "Không tìm thấy hội đồng phù hợp"
                  : "Chưa có dữ liệu"
              }
              emptyIcon={
                <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              }
              keyExtractor={(council) => String(council.councilId)}
            />
          </CardContent>
        </Card>

        {filteredData.length > 0 && (
          <TablePagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems}
            totalPages={pagination.totalPages}
            startItem={pagination.startItem}
            endItem={pagination.endItem}
            hasNext={pagination.hasNext}
            hasPrevious={pagination.hasPrevious}
            isLoading={isLoading}
            onPrevious={pagination.previousPage}
            onNext={pagination.nextPage}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
          />
        )}
      </div>
    </DeanLayout>
  );
}
