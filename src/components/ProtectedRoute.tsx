import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireAnyRole?: boolean;
  redirectTo?: string;
}

/**
 * Route guard component for protected pages.
 * - requireAuth: user must be logged in
 * - requireAdmin: user must have admin role
 * - requireAnyRole: user must have any admin/editor/moderator role
 */
const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireAnyRole = false,
  redirectTo,
}: ProtectedRouteProps) => {
  const { user, isAdmin, hasAnyRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">যাচাই করা হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={redirectTo || `/login?returnUrl=${returnUrl}`} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requireAnyRole && !isAdmin && !hasAnyRole) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
