import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
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
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600", 
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
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      features: [
        "Evidence analysis tools",
        "Assessment workflows",
        "Collaborative reviews",
        "Decision tracking"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Enhanced Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">POSH Compliance AI</h1>
                <p className="text-xs text-white/70">Secure • Confidential • Supportive</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                Live Demo
              </Badge>
              
              {/* Quick help button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => window.open('/help', '_blank')}
              >
                Need Help?
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 lg:py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30">
              Trauma-Informed Design • WCAG 2.1 AA Compliant
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Safe Space for
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Speaking Up
              </span>
            </h1>
            
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              AI-enhanced POSH compliance system that builds trust, ensures confidentiality, 
              and provides human support when you need it most.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <Lock className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">100% Confidential</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <Heart className="w-5 h-5 text-pink-400" />
              <span className="text-white font-medium">Trauma-Informed</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <UserCheck className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">Human Support</span>
            </div>
          </div>
        </div>

        {/* Role Selection Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Choose Your Role to Continue
            </h2>
            <p className="text-white/70 text-lg">
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
                      ? 'bg-white/20 border-blue-400 ring-2 ring-blue-400' 
                      : 'bg-white/10 border-white/20 hover:bg-white/15'
                    } 
                    backdrop-blur-sm hover:shadow-xl
                  `}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`
                      w-16 h-16 mx-auto mb-4 rounded-full ${role.color} flex items-center justify-center
                      group-hover:scale-110 transition-transform duration-300
                    `}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    
                    <CardTitle className="text-2xl font-bold text-white mb-2">
                      {role.title}
                    </CardTitle>
                    
                    <CardDescription className="text-lg text-blue-200 font-medium">
                      {role.subtitle}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-white/80 mb-6 text-center leading-relaxed">
                      {role.description}
                    </p>
                    
                    {/* Feature list */}
                    <ul className="space-y-2 mb-6">
                      {role.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-white/70">
                          <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      asChild 
                      className={`
                        w-full ${role.color} ${role.hoverColor} text-white font-medium
                        shadow-lg hover:shadow-xl transition-all duration-300
                        group-hover:bg-white group-hover:text-gray-900
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
                    <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Support Resources Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Need Immediate Support?
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              You don't have to go through this alone. Multiple support options are available 24/7.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white/5 rounded-lg border border-white/10">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Crisis Helpline</h3>
              <p className="text-white/70 text-sm mb-3">24/7 confidential support</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/30 text-white hover:bg-white hover:text-gray-900"
                onClick={() => window.open('tel:1-800-HELP', '_blank')}
              >
                1-800-HELP
              </Button>
            </div>

            <div className="text-center p-6 bg-white/5 rounded-lg border border-white/10">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Live Chat</h3>
              <p className="text-white/70 text-sm mb-3">Connect with trained counselors</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/30 text-white hover:bg-white hover:text-gray-900"
                onClick={() => window.open('/chat', '_blank')}
              >
                Start Chat
              </Button>
            </div>

            <div className="text-center p-6 bg-white/5 rounded-lg border border-white/10">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Resources</h3>
              <p className="text-white/70 text-sm mb-3">Policies, guides, and FAQ</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/30 text-white hover:bg-white hover:text-gray-900"
                onClick={() => window.open('/resources', '_blank')}
              >
                View Resources
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-8">
            Making a Difference
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">60%</div>
              <div className="text-white/70 text-sm">Increase in Reporting</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">75%</div>
              <div className="text-white/70 text-sm">Faster Processing</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">100%</div>
              <div className="text-white/70 text-sm">Compliance Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">4.8/5</div>
              <div className="text-white/70 text-sm">User Satisfaction</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/5 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white/60">
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