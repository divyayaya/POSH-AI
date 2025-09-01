import { Button } from "@/components/ui/button";
import { Shield, Home, FileText, BarChart3, LogOut, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, isHRAdmin, isICCMember } = useAuth();

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "POSH-AI Dashboard";
      case "/file-complaint":
        return "File Complaint";
      case "/hr-dashboard":
        return "HR Dashboard";
      case "/admin/webhook-test":
        return "Webhook Testing";
      default:
        if (location.pathname.includes("human-review")) {
          return "Human Review";
        }
        if (location.pathname.includes("investigation")) {
          return "Investigation";
        }
        return "POSH-AI";
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-4">
          <Button
            variant={location.pathname === "/" ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate("/")}
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          
          <Button
            variant={location.pathname === "/file-complaint" ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate("/file-complaint")}
          >
            <FileText className="h-4 w-4 mr-2" />
            File Complaint
          </Button>

          {(isHRAdmin || isICCMember) && (
            <Button
              variant={location.pathname === "/hr-dashboard" ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate("/hr-dashboard")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              HR Dashboard
            </Button>
          )}

          {isHRAdmin && (
            <Button
              variant={location.pathname === "/admin/webhook-test" ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate("/admin/webhook-test")}
            >
              Admin
            </Button>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {profile?.full_name ? getInitials(profile.full_name) : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.full_name || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {profile?.role?.replace('_', ' ').toUpperCase()} • {profile?.department}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;