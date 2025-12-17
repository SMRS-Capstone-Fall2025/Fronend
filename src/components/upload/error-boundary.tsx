import { Component, ErrorInfo, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useAuthAccountStore } from "@/lib/auth-store";
import { getDefaultRouteByRole, normalizeRole } from "@/lib/utils";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
    if (import.meta.env.DEV) {
      console.error("Caught by ErrorBoundary", error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false });
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorBoundaryFallback onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

function ErrorBoundaryFallback({ onReset }: { onReset: () => void }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const account = useAuthAccountStore((s) => s.account);

  const roleFromAccount =
    account?.roleName ??
    (typeof account?.role === "object" && account?.role !== null
      ? account.role.roleName
      : typeof account?.role === "string"
      ? account.role
      : null);

  const role = roleFromAccount ?? (user?.role ? String(user.role) : null);

  const normalizedRole = normalizeRole(role);
  const defaultRoute = getDefaultRouteByRole(normalizedRole ?? role);

  const handleGoHome = () => {
    navigate(defaultRoute);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-6">
        <div>
          <p className="text-sm font-semibold text-primary mb-2">
            Đã có lỗi xảy ra
          </p>
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            Rất tiếc, có lỗi không mong muốn
          </h1>
          <p className="text-muted-foreground">
            Chúng tôi đã ghi nhận sự cố này. Hãy thử tải lại trang hoặc quay lại
            trang chủ để tiếp tục.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={onReset}>
            Thử lại
          </Button>
          <Button onClick={handleGoHome}>Về trang chủ</Button>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
