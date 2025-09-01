import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallbackPath?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  fallbackPath = "/auth" 
}: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated, redirect to auth page
        navigate(fallbackPath);
        return;
      }

      if (requiredRoles.length > 0 && profile) {
        // Check if user has required role
        if (!requiredRoles.includes(profile.role)) {
          // User doesn't have required role, redirect to unauthorized page
          navigate("/unauthorized");
          return;
        }
      }
    }
  }, [user, profile, loading, navigate, requiredRoles, fallbackPath]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  if (requiredRoles.length > 0 && profile && !requiredRoles.includes(profile.role)) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
};