import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <Logo className="w-auto mb-6" />
      <p className="text-sm font-semibold text-primary mb-2">404</p>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
        Không tìm thấy trang
      </h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Có vẻ như đường dẫn bạn đang truy cập không tồn tại hoặc đã được di
        chuyển. Hãy quay lại trang chủ để tiếp tục trải nghiệm.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => window.history.back()} variant="outline">
          Quay lại
        </Button>
        <Button asChild>
          <Link to="/">Về trang chủ</Link>
        </Button>
      </div>
    </div>
  );
}
