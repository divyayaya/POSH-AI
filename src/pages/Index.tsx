import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/AppHeader";
import { 
  FileText, 
  Users, 
  Shield, 
  Zap, 
  BarChart3, 
  Clock, 
  Lock, 
  Phone, 
  MessageCircle, 
  CheckCircle, 
  ArrowRight,
  Heart,
  Eye,
  UserCheck
} from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [selectedRole, setSelectedRole] = useState(null);

  const roleCards = [
    {
      id: "employee",
      title: "Employee",
      subtitle: "Report a workplace concern",  
      description: "Confidential reporting with AI guidance and human support",
      icon: FileText,
      route: "/file-complaint",
      color: "bg-gentle-teal",
      hoverColor: "hover:bg-gentle-teal/90",
      features: [
        "Anonymous reporting option",
        "Step-by-step guidance", 
        "Auto-save progress",
        "24/7 support access"
      ]
    },
    {
      id: "hr",
      title: "HR Professional", 
      subtitle: "Manage cases & compliance",
      description: "Streamlined case management with automated workflows",
      icon: Users,
      route: "/hr-dashboard",
      color: "bg-soft-sage", 
      hoverColor: "hover:bg-soft-sage/90",
      features: [
        "Real-time case tracking",
        "Automated compliance alerts", 
        "Integrated reporting tools",
        "Performance analytics"
      ]
    },
    {
      id: "icc",
      title: "ICC Member",
      subtitle: "Review cases & investigations",
      description: "Human oversight for complex cases requiring expert judgment",
      icon: Shield,
      route: "/human-review/POSH-2024-001", 
      color: "bg-soft-lavender",
      hoverColor: "hover:bg-soft-lavender/90",
      features: [
        "Evidence analysis tools",
        "Assessment workflows",
        "Collaborative reviews", 
        "Decision tracking"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader showNavigation={false} />

      <main className="container mx-auto px-4 py-8 lg:py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Safe Space for
              <br />
              <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                Speaking Up
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              AI-enhanced POSH compliance system that builds trust, ensures confidentiality, 
              and provides human support when you need it most.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 bg-muted/50 rounded-lg p-4 border border-border">
              <Lock className="w-5 h-5 text-success" />
              <span className="text-foreground font-medium">100% Confidential</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-muted/50 rounded-lg p-4 border border-border">
              <Heart className="w-5 h-5 text-destructive" />
              <span className="text-foreground font-medium">Trauma-Informed</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-muted/50 rounded-lg p-4 border border-border">
              <UserCheck className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">Human Support</span>
            </div>
          </div>
        </div>

        {/* Role Selection Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Choose Your Role to Continue
            </h2>
            <p className="text-muted-foreground text-lg">
              Select the option that best describes your access needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {roleCards.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              
              return (
                <Card 
                  key={role.id}
                  className={`
                    relative group cursor-pointer transition-all duration-300 hover:scale-105
                    ${isSelected 
                      ? 'bg-card border-primary ring-2 ring-primary' 
                      : 'bg-card border-border hover:bg-accent/5'
                    } 
                    hover:shadow-xl
                  `}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`
                      w-16 h-16 mx-auto mb-4 rounded-full ${role.color} flex items-center justify-center
                      group-hover:scale-110 transition-transform duration-300
                    `}>
                      <Icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    
                    <CardTitle className="text-2xl font-bold text-card-foreground mb-2">
                      {role.title}
                    </CardTitle>
                    
                    <CardDescription className="text-lg text-muted-foreground font-medium">
                      {role.subtitle}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-muted-foreground mb-6 text-center leading-relaxed">
                      {role.description}
                    </p>
                    
                    {/* Feature list */}
                    <ul className="space-y-2 mb-6">
                      {role.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-success mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      asChild 
                      className={`
                        w-full ${role.color} ${role.hoverColor} text-primary-foreground font-medium
                        shadow-lg hover:shadow-xl transition-all duration-300
                      `}
                      size="lg"
                    >
                      <Link to={role.route} className="flex items-center justify-center">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                  
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        

        {/* Support Resources Section */}
        <div className="bg-muted/30 rounded-2xl border border-border p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Need Immediate Support?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              You don't have to go through this alone. Multiple support options are available 24/7.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-card rounded-lg border border-border">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-card-foreground mb-2">Crisis Helpline</h3>
              <p className="text-muted-foreground text-sm mb-3">24/7 confidential support</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open('tel:1-800-HELP', '_blank')}
              >
                1-800-HELP
              </Button>
            </div>

            <div className="text-center p-6 bg-card rounded-lg border border-border">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="font-semibold text-card-foreground mb-2">Live Chat</h3>
              <p className="text-muted-foreground text-sm mb-3">Connect with trained counselors</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open('/chat', '_blank')}
              >
                Start Chat
              </Button>
            </div>

            <div className="text-center p-6 bg-card rounded-lg border border-border">
              <div className="w-12 h-12 bg-accent-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-card-foreground mb-2">Resources</h3>
              <p className="text-muted-foreground text-sm mb-3">Policies, guides, and FAQ</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open('/resources', '_blank')}
              >
                View Resources
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">
              Built with care for workplace safety and employee wellbeing
            </p>
            <p className="text-sm">
              This is a demonstration system showcasing trauma-informed design principles
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;