import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, BarChart3, Users, Shield, AlertTriangle, CheckCircle, Clock, Scale } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { profile, isHRAdmin, isICCMember, canViewAllCases } = useAuth();

  const quickActions = [
    {
      title: "File New Complaint",
      description: "Submit a new POSH complaint confidentially",
      icon: FileText,
      path: "/file-complaint",
      variant: "default" as const,
      available: true
    },
    {
      title: "HR Dashboard",
      description: "View and manage all cases and compliance",
      icon: BarChart3,
      path: "/hr-dashboard",
      variant: "secondary" as const,
      available: canViewAllCases
    },
    {
      title: "Webhook Testing",
      description: "Test n8n workflow integrations",
      icon: Shield,
      path: "/admin/webhook-test",
      variant: "outline" as const,
      available: isHRAdmin
    }
  ];

  const systemFeatures = [
    {
      icon: Shield,
      title: "AI-Powered Analysis",
      description: "Automated evidence assessment and credibility scoring",
      status: "active"
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Secure access control for HR, ICC members, and investigators",
      status: "active"
    },
    {
      icon: Scale,
      title: "POSH Compliance",
      description: "90-day investigation tracking and legal compliance",
      status: "active"
    },
    {
      icon: Clock,
      title: "Automated Workflows",
      description: "n8n integration for notifications and task management",
      status: "active"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      <AppHeader />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to POSH-AI</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Intelligent case management system ensuring POSH Act compliance with AI-powered analysis and automated workflows
          </p>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{profile?.role?.replace('_', ' ').toUpperCase()}</span>
            </Badge>
            {profile?.department && (
              <Badge variant="outline">
                {profile.department}
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => {
              if (!action.available) return null;
              
              const Icon = action.icon;
              return (
                <Card key={action.title} className="cursor-pointer hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                    </div>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => navigate(action.path)}
                      variant={action.variant}
                      className="w-full"
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* System Status */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">System Features</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {systemFeatures.map((feature) => {
              const Icon = feature.icon;
              const isActive = feature.status === "active";
              
              return (
                <Card key={feature.title} className="text-center">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Icon className={`h-6 w-6 ${isActive ? 'text-green-600' : 'text-muted-foreground'}`} />
                      {isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <CardTitle className="text-sm">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Compliance Notice */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Scale className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">POSH Act Compliance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This system ensures full compliance with the Prevention of Sexual Harassment (POSH) Act, 2013. 
              All cases are handled with strict confidentiality and follow prescribed timelines.
            </p>
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>90-day investigation timeline</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Confidential complaint handling</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Automated compliance tracking</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;