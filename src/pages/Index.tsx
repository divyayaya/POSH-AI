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
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            AI-Enhanced POSH
            <br />
            <span className="text-secondary">Compliance System</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Transforming workplace safety through intelligent automation. 
            Increase reporting rates by 60% and reduce processing time by 75% 
            with AI-powered workflows and human oversight.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-glow">
              <Link to="/file-complaint">
                <FileText className="mr-2 h-5 w-5" />
                File a Complaint
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary backdrop-blur-sm">
              <Link to="/hr-dashboard">
                <Users className="mr-2 h-5 w-5" />
                HR Dashboard
              </Link>
            </Button>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-white/70 mb-4">Experience the full AI-powered workflow:</p>
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Auto HRIS Integration
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Real-time Evidence Scoring
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                n8n Workflow Automation
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Human-in-the-Loop Review
              </Badge>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
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

        {/* Key Metrics */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">Proven Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-3xl font-bold text-secondary mb-2">+60%</div>
              <div className="text-white/80">Reporting Rate Increase</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-3xl font-bold text-secondary mb-2">75%</div>
              <div className="text-white/80">Faster Processing</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-3xl font-bold text-secondary mb-2">100%</div>
              <div className="text-white/80">Compliance Rate</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-3xl font-bold text-secondary mb-2">$1.2M</div>
              <div className="text-white/80">Annual Savings</div>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">System Access</CardTitle>
              <CardDescription className="text-white/80">
                Choose your role to access the appropriate interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full border-white/30 text-white hover:bg-white hover:text-primary">
                <Link to="/file-complaint">Employee - File Complaint</Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-white/30 text-white hover:bg-white hover:text-primary">
                <Link to="/hr-dashboard">HR Professional - Dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-white/30 text-white hover:bg-white hover:text-primary">
                <Link to="/human-review/POSH-2024-001">ICC Member - Review Cases</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <BarChart3 className="mr-2 h-5 w-5 text-secondary" />
                Integration & Testing
              </CardTitle>
              <CardDescription className="text-white/80">
                n8n workflows and system administration tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full border-white/30 text-white hover:bg-white hover:text-primary">
                <Link to="/admin/webhook-test">Webhook Testing Interface</Link>
              </Button>
              <div className="text-sm text-white/70">
                Test n8n workflow integrations and monitor system health
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;