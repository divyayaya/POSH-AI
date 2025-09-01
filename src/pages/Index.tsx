import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, Shield, Zap, BarChart3, Clock } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">POSH Compliance AI</h1>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Demo System
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Main Heading */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-8">
            AI-Enhanced POSH Compliance System
          </h1>
          
          {/* Role Selection Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-glow">
              <Link to="/file-complaint">
                <FileText className="mr-2 h-5 w-5" />
                Employee
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-glow">
              <Link to="/hr-dashboard">
                <Users className="mr-2 h-5 w-5" />
                HR Professional
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-glow">
              <Link to="/human-review/POSH-2024-001">
                <Shield className="mr-2 h-5 w-5" />
                ICC Member
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Zap className="mr-2 h-5 w-5 text-secondary" />
                AI-Powered Assessment
              </CardTitle>
              <CardDescription className="text-white/80">
                Intelligent evidence scoring and automatic pathway determination
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-white/70">
                Real-time analysis of evidence quality with smart recommendations for investigation pathways.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Users className="mr-2 h-5 w-5 text-secondary" />
                Human-in-the-Loop
              </CardTitle>
              <CardDescription className="text-white/80">
                Expert oversight for critical decisions and complex cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-white/70">
                ICC members provide human judgment where AI assessment requires additional expertise.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Clock className="mr-2 h-5 w-5 text-secondary" />
                Automated Compliance
              </CardTitle>
              <CardDescription className="text-white/80">
                Deadline tracking and regulatory requirement management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-white/70">
                Automatic monitoring of POSH Act timelines with proactive alerts and escalations.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;