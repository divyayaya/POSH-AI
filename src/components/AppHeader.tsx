import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Shield, 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  FileText,
  Users,
  BarChart3,
  Menu,
  X,
  Calendar,
  CheckSquare
} from "lucide-react";

interface AppHeaderProps {
  showNavigation?: boolean;
  userRole?: 'employee' | 'hr' | 'icc';
  notifications?: number;
  customTitle?: string;
  customActions?: React.ReactNode;
}

export const AppHeader = ({ 
  showNavigation = true, 
  userRole = 'employee',
  notifications = 0,
  customTitle,
  customActions
}: AppHeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const getRoleInfo = () => {
    switch (userRole) {
      case 'hr':
        return { name: 'Sarah Chen', title: 'HR Manager', department: 'Human Resources' };
      case 'icc':
        return { name: 'Dr. Priya Sharma', title: 'ICC Member', department: 'Internal Committee' };
      default:
        return { name: 'John Doe', title: 'Software Engineer', department: 'Engineering' };
    }
  };

  const getNavigationItems = () => {
    switch (userRole) {
      case 'hr':
        return [
          { name: 'Dashboard', href: '/hr-dashboard', icon: BarChart3 },
          { name: 'Cases', href: '/cases', icon: FileText },
          { name: 'Reports', href: '/reports', icon: BarChart3 }
        ];
      case 'icc':
        return [
          { name: 'Dashboard', href: '/icc-dashboard', icon: BarChart3 },
          { name: 'Cases', href: '/icc-cases', icon: FileText },
          { name: 'Calendar', href: '/icc-calendar', icon: Calendar }
        ];
      default:
        return [
          { name: 'File Complaint', href: '/file-complaint', icon: FileText },
          { name: 'My Cases', href: '/my-cases', icon: Users },
          { name: 'Resources', href: '/resources', icon: BarChart3 }
        ];
    }
  };

  const roleInfo = getRoleInfo();
  const navigationItems = getNavigationItems();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground">POSH AI</h1>
              <p className="text-xs text-muted-foreground">Compliance System</p>
            </div>
          </Link>
        </div>

        {/* Custom Title or Navigation */}
        <div className="flex-1 flex items-center justify-center">
          {customTitle ? (
            <h1 className="text-xl font-semibold text-foreground">{customTitle}</h1>
          ) : showNavigation && (
            <nav className="hidden md:flex items-center space-x-6">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href || 
                  (item.href !== '/' && location.pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Actions and User Menu */}
        <div className="flex items-center space-x-4">
          {/* Custom Actions */}
          {customActions}
          
          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground">
                  {notifications > 9 ? '9+' : notifications}
                </Badge>
              )}
            </Button>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-foreground">{roleInfo.name}</div>
                    <div className="text-xs text-muted-foreground">{roleInfo.title}</div>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <div className="text-sm font-medium">{roleInfo.name}</div>
                <div className="text-xs text-muted-foreground">{roleInfo.department}</div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && showNavigation && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <nav className="container mx-auto px-4 py-2">
            <div className="flex flex-col space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};