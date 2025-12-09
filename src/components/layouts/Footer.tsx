import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">SMRS</h3>
            <p className="text-sm text-primary-foreground/70">
              Nền tảng quản lý nghiên cứu và đồ án giúp đội ngũ học thuật phối
              hợp hiệu quả.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Liên kết</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="#"
                  className="text-primary-foreground/70 hover:text-primary-foreground"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  to="#courses"
                  className="text-primary-foreground/70 hover:text-primary-foreground"
                >
                  Khóa học
                </Link>
              </li>
              <li>
                <Link
                  to="#instructors"
                  className="text-primary-foreground/70 hover:text-primary-foreground"
                >
                  Giảng viên
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Pháp lý</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="#"
                  className="text-primary-foreground/70 hover:text-primary-foreground"
                >
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-primary-foreground/70 hover:text-primary-foreground"
                >
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Liên hệ</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>Email: support@smrs.vn</li>
              <li>Hotline: 1900 8686</li>
              <li>Địa chỉ: 456 Đường Innovation, Quận 1, TP.HCM</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/70">
          <p>&copy; {new Date().getFullYear()} SMRS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
