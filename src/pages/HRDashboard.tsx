import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AppHeader } from "@/components/AppHeader";
import { AlertTriangle, CheckCircle, BarChart3, Users, Calendar, FileText, Bell, MessageSquare, Zap, TrendingUp, Clock, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const HRDashboard = () => {
  const [notifications] = useState(3);
  const [pendingCases, setPendingCases] = useState([]);
  const [allCases, setAllCases] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch cases from database
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const { data, error } = await supabase
          .from('cases')
          .select(`
            *,
            evidence (id, type, score),
            compliance_deadlines (deadline_date, deadline_type, urgency_level)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setAllCases(data || []);
        setPendingCases(data?.filter(case_ => case_.status === 'pending') || []);
      } catch (error) {
        console.error('Error fetching cases:', error);
        toast.error('Failed to load case data');
      } finally {
        setLoadingData(false);
      }
    };

    fetchCases();

    // Set up real-time subscription for new cases
    const subscription = supabase
      .channel('hr_dashboard_cases')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'cases' },
        (payload) => {
          setAllCases(prev => [payload.new, ...prev]);
          if (payload.new.status === 'pending') {
            setPendingCases(prev => [payload.new, ...prev]);
            toast.info(`New case filed: ${payload.new.case_number}`);
          }
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'cases' },
        (payload) => {
          setAllCases(prev => prev.map(case_ => 
            case_.id === payload.new.id ? payload.new : case_
          ));
          setPendingCases(prev => 
            payload.new.status === 'pending' 
              ? prev.map(case_ => case_.id === payload.new.id ? payload.new : case_)
              : prev.filter(case_ => case_.id !== payload.new.id)
          );
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-primary text-primary-foreground';
      case 'investigating':
        return 'bg-warning text-warning-foreground';
      case 'resolved':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-destructive text-destructive';
      case 'medium':
        return 'border-warning text-warning';
      case 'low':
        return 'border-success text-success';
      default:
        return 'border-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        userRole="hr" 
        notifications={notifications}
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">HR Dashboard</h1>
          <p className="text-muted-foreground">Monitor compliance, manage cases, and oversee workplace safety initiatives.</p>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Cases Resolved</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-foreground">
                      {allCases.filter(c => c.status === 'resolved').length}
                    </p>
                    <p className="ml-2 text-sm text-green-600 font-medium">+12%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Average Response Time</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-foreground">4.2h</p>
                    <p className="ml-2 text-sm text-blue-600 font-medium">-8%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Staff Training Rate</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-foreground">94%</p>
                    <p className="ml-2 text-sm text-purple-600 font-medium">+5%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-orange-100 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Policy Adherence</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-foreground">98%</p>
                    <p className="ml-2 text-sm text-orange-600 font-medium">+2%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Compliance Status Widget */}
          <Card className="lg:col-span-2 bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Compliance Status</CardTitle>
              <CardDescription>
                Upcoming deadlines and critical compliance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-foreground">ICC Training Renewal</p>
                      <p className="text-xs text-muted-foreground">Due in 3 days</p>
                    </div>
                  </div>
                  <Badge variant="destructive" className="text-xs">Urgent</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border border-orange-200 bg-orange-50">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Quarterly Report</p>
                      <p className="text-xs text-muted-foreground">Due in 12 days</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">Medium</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border border-green-200 bg-green-50">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Policy Review</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs border-green-200 text-green-700">Complete</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Cases Widget */}
          <Card className="lg:col-span-3 bg-card border border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-foreground font-semibold">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                </div>
                <span>Pending Cases Requiring Action</span>
                <Badge variant="secondary" className="ml-auto bg-orange-500/10 text-orange-700">
                  {pendingCases.length} pending
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : pendingCases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
                  <p>No pending cases - all caught up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingCases.slice(0, 5).map((case_) => (
                    <div key={case_.id} className="group relative overflow-hidden rounded-lg border border-border bg-background hover:shadow-sm transition-all duration-200">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />
                      <div className="flex items-center justify-between p-4 pl-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-semibold text-foreground">
                              {case_.case_number}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                case_.priority === 'high' ? 'border-red-200 text-red-700' :
                                case_.priority === 'medium' ? 'border-yellow-200 text-yellow-700' :
                                'border-green-200 text-green-700'
                              }`}
                            >
                              {case_.priority} priority
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {case_.title}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                            <span>Filed: {new Date(case_.created_at).toLocaleDateString()}</span>
                            <span>Evidence Score: {case_.evidence_score}/100</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/human-review/${case_.id}`}>
                              Review
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {pendingCases.length > 5 && (
                    <div className="text-center pt-2">
                      <Button variant="ghost" size="sm">
                        View all {pendingCases.length} pending cases
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 mt-6">
          {/* Quick Actions Panel */}
          <Card className="lg:col-span-2 bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and system management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                Generate Compliance Report
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule ICC Meeting
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Review Staff Training
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Update Policies
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Bell className="mr-2 h-4 w-4" />
                Send Notifications
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="lg:col-span-3 bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-foreground">
                <Zap className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>
                Live feed of system activities and case updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 rounded-lg border border-border bg-background">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 bg-primary rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">New case filed</p>
                    <p className="text-xs text-muted-foreground">Case POSH-2024-045 reported by Anonymous • Engineering Dept</p>
                    <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg border border-border bg-background">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 bg-warning rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Case status updated</p>
                    <p className="text-xs text-muted-foreground">Case POSH-2024-043 moved to investigation • Marketing Dept</p>
                    <p className="text-xs text-muted-foreground mt-1">15 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg border border-border bg-background">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 bg-success rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Training completed</p>
                    <p className="text-xs text-muted-foreground">ICC member Sarah Chen completed annual refresher • HR Dept</p>
                    <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg border border-border bg-background">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 bg-warning rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Deadline reminder</p>
                    <p className="text-xs text-muted-foreground">Case POSH-2024-041 approaching 90-day deadline • Sales Dept</p>
                    <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg border border-border bg-background">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 bg-success rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Case resolved</p>
                    <p className="text-xs text-muted-foreground">Case POSH-2024-040 successfully closed • Operations Dept</p>
                    <p className="text-xs text-muted-foreground mt-1">3 hours ago</p>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <Button variant="ghost" size="sm" className="text-xs">
                    View All Activity
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default HRDashboard;