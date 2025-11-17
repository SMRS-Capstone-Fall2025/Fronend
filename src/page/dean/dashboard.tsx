import { useNavigate } from "react-router-dom";
import DeanLayout from "./layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users2, ClipboardList, FolderKanban } from "lucide-react";

function DeanDashboardContent() {
  const navigate = useNavigate();

  // Placeholder metrics until hooked to real data sources.
  const stats = [
    {
      label: "Hội đồng hoạt động",
      value: 4,
      icon: Users2,
      description: "Tổng số hội đồng đang nhận dự án",
    },
    {
      label: "Dự án chờ duyệt",
      value: 7,
      icon: ClipboardList,
      description: "Số dự án cần quyết định trong tuần",
    },
    {
      label: "Dự án đã gán hội đồng",
      value: 12,
      icon: FolderKanban,
      description: "Dự án đã được phân hội đồng đánh giá",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">
          Bảng điều khiển trưởng khoa
        </h1>
        <p className="text-sm text-muted-foreground">
          Theo dõi tiến độ phân công hội đồng và phê duyệt dự án trong khoa.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.label}
              className="border-border/60 bg-background/80"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </CardTitle>
                <Badge variant="outline" className="px-2">
                  <Icon className="h-4 w-4" />
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-foreground">
                  {item.value}
                </div>
                <CardDescription className="mt-1">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 bg-background/80">
          <CardHeader>
            <CardTitle>Quản lý hội đồng</CardTitle>
            <CardDescription>
              Tạo mới, chỉnh sửa thành viên và theo dõi trạng thái hoạt động của
              từng hội đồng.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm text-muted-foreground max-w-lg">
              Đảm bảo mỗi hội đồng có tối đa 5 giảng viên và được phân công dự
              án phù hợp.
            </p>
            <Button type="button" onClick={() => navigate("/dean/councils")}>
              Quản lý hội đồng
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-background/80">
          <CardHeader>
            <CardTitle>Phê duyệt dự án</CardTitle>
            <CardDescription>
              Theo dõi các dự án đang chờ duyệt và gán hội đồng đánh giá.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm text-muted-foreground max-w-lg">
              Xem chi tiết, đưa ra quyết định và phân công hội đồng chỉ với vài
              bước.
            </p>
            <Button type="button" variant="secondary" disabled>
              Sắp ra mắt
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default function DeanDashboardPage() {
  return (
    <DeanLayout>
      <DeanDashboardContent />
    </DeanLayout>
  );
}
