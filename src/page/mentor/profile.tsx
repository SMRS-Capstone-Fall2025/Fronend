import MentorLayout from "./layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";

export default function MentorProfile() {
  const { user } = useAuth();

  return (
    <MentorLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-base font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() ?? "M"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold">
                {user?.name ?? "Mentor ẩn danh"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {user?.email ?? "Chưa cập nhật email"}
              </p>
              <Badge variant="secondary" className="text-xs">
                Vai trò: Mentor
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Chuyên môn chính
              </h2>
              <p>
                Kinh nghiệm coaching dự án công nghệ, đào tạo kỹ năng nghiên cứu
                và hỗ trợ đội ngũ học viên trong giai đoạn hoàn thiện sản phẩm.
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">
                Thông tin liên hệ
              </h2>
              <p>Email: {user?.email ?? "Chưa có"}</p>
            </div>
            <Button variant="outline" className="mt-2">
              Cập nhật hồ sơ
            </Button>
          </CardContent>
        </Card>
      </div>
    </MentorLayout>
  );
}
