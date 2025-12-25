import AdminLayout from '../layout';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, TrendingUp, Users } from 'lucide-react';

function AdminReportsPage() {

  const reports = [
    {
      id: 1,
      title: 'Báo cáo doanh thu tháng 1/2024',
      type: 'financial',
      status: 'completed',
      generatedAt: '2024-01-31',
      size: '2.3 MB'
    },
    {
      id: 2,
      title: 'Báo cáo học viên mới',
      type: 'student',
      status: 'completed',
      generatedAt: '2024-01-30',
      size: '1.8 MB'
    },
    {
      id: 3,
      title: 'Báo cáo hiệu suất giảng viên',
      type: 'instructor',
      status: 'generating',
      generatedAt: '2024-01-29',
      size: '3.1 MB'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'financial':
        return <TrendingUp className="h-4 w-4" />;
      case 'student':
        return <Users className="h-4 w-4" />;
      case 'instructor':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'generating':
        return 'Đang tạo';
      case 'failed':
        return 'Thất bại';
      default:
        return 'Không xác định';
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <FileText className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Báo cáo</h1>
            <p className="text-sm text-muted-foreground">
              Xem và quản lý các báo cáo tài chính và thống kê hệ thống
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-end items-center">
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Tạo báo cáo mới
        </Button>
      </div>

      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(report.type)}
                  <div>
                    <CardTitle>{report.title}</CardTitle>
                    <CardDescription>
                      Tạo lúc: {report.generatedAt} • Kích thước: {report.size}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(report.status)}>
                    {getStatusText(report.status)}
                  </Badge>
                  {report.status === 'completed' && (
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Tải xuống
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function AdminReports() {
  return (
    <AdminLayout>
      <AdminReportsPage />
    </AdminLayout>
  );
}
