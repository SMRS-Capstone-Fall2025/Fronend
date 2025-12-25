import MentorLayout from "./layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { LayoutDashboard } from "lucide-react";

export default function MentorDashboard() {
  return (
    <MentorLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <LayoutDashboard className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Bảng điều khiển
              </h1>
              <p className="text-sm text-muted-foreground">
                Tổng quan về các lớp học, dự án và công việc đang diễn ra
              </p>
            </div>
          </div>
        </div>
        <Card className="border-primary/10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              Chào mừng mentor!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Cập nhật tiến độ dự án, theo dõi công việc của học viên và hỗ trợ
              nhóm hiệu quả hơn.
            </p>
            <p>
              Khu vực mentor cung cấp cái nhìn tổng quan về các lớp học, dự án
              và công việc đang diễn ra.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Lớp phụ trách</CardTitle>
              <p className="text-xs text-muted-foreground">
                Tổng số lớp đang đào tạo trong tuần này
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold">3</span>
                <Badge variant="outline" className="text-xs">
                  +1 so với tuần trước
                </Badge>
              </div>
              <Progress value={66} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Dự án đang mentoring</CardTitle>
              <p className="text-xs text-muted-foreground">
                Các dự án cần theo dõi sát sao trong tuần
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold">5</span>
                <Badge variant="outline" className="text-xs">
                  2 sắp đến hạn
                </Badge>
              </div>
              <Progress value={45} className="bg-amber-100" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Feedback cần xử lý</CardTitle>
              <p className="text-xs text-muted-foreground">
                Số lượng phản hồi chờ mentor phản hồi
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-emerald-600">
                  8
                </span>
                <Badge variant="outline" className="text-xs">
                  Cần phản hồi sớm
                </Badge>
              </div>
              <Progress value={30} className="bg-emerald-100" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lịch trình trong ngày</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <div className="flex items-center justify-between text-foreground">
                <span className="font-medium">09:00 • Coaching Capstone</span>
                <Badge variant="secondary">Online</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Hỗ trợ nhóm Capstone hoàn thiện mô-đun báo cáo.
              </p>
            </div>
            <Separator />
            <div>
              <div className="flex items-center justify-between text-foreground">
                <span className="font-medium">13:30 • Review task</span>
                <Badge variant="secondary">Tại lab</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Kiểm tra tiến độ task của học viên lớp kỹ năng nâng cao.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MentorLayout>
  );
}
