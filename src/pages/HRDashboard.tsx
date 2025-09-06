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
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);

  // Fetch recent activity from multiple tables
  const fetchRecentActivity = async () => {
    try {
      setLoadingActivity(true);
      const activities = [];

      // 1. Recent cases
      const { data: recentCases } = await supabase
        .from('cases')
        .select('id, case_number, title, status, priority, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(5);

      recentCases?.forEach(case_ => {
        activities.push({
          id: `case-${case_.id}`,
          type: 'case_created',
          title: 'New case filed',
          description: `${case_.case_number} - ${case_.title}`,
          priority: case_.priority,
          timestamp: case_.created_at,
          icon: 'FileText',
          color: 'blue'
        });
      });

      // 2. Recent case reviews
      const { data: recentReviews } = await supabase
        .from('case_reviews')
        .select(`
          id, investigation_pathway, credibility_assessment, created_at,
          cases!inner(case_number, title)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      recentReviews?.forEach(review => {
        activities.push({
          id: `review-${review.id}`,
          type: 'review_completed',
          title: 'Case review completed',
          description: `${review.cases.case_number} reviewed - ${review.investigation_pathway} pathway`,
          timestamp: review.created_at,
          icon: 'CheckCircle',
          color: 'green'
        });
      });

      // 3. Recent evidence uploads
      const { data: recentEvidence } = await supabase
        .from('evidence')
        .select(`
          id, type, description, score, created_at,
          cases!inner(case_number)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      recentEvidence?.forEach(evidence => {
        activities.push({
          id: `evidence-${evidence.id}`,
          type: 'evidence_uploaded',
          title: 'Evidence uploaded',
          description: `${evidence.cases.case_number} - ${evidence.description}`,
          timestamp: evidence.created_at,
          icon: 'Upload',
          color: 'purple'
        });
      });

      // 4. Approaching deadlines
      const { data: upcomingDeadlines } = await supabase
        .from('compliance_deadlines')
        .select(`
          id, deadline_date, deadline_type, urgency_level, created_at,
          cases!inner(case_number, title)
        `)
        .gte('deadline_date', new Date().toISOString())
        .order('deadline_date', { ascending: true })
        .limit(3);

      upcomingDeadlines?.forEach(deadline => {
        const daysUntil = Math.ceil((new Date(deadline.deadline_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 30) {
          activities.push({
            id: `deadline-${deadline.id}`,
            type: 'deadline_approaching',
            title: `Deadline approaching (${daysUntil} days)`,
            description: `${deadline.cases.case_number} - ${deadline.deadline_type}`,
            timestamp: deadline.created_at,
            urgency: deadline.urgency_level,
            icon: 'Clock',
            color: daysUntil <= 7 ? 'red' : 'yellow'
          });
        }
      });

      // Sort all activities by timestamp and take most recent 10
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      setRecentActivity(sortedActivities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      toast.error('Failed to load recent activity');
    } finally {
      setLoadingActivity(false);
    }
  };

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
    fetchRecentActivity();

    // Set up real-time subscription for new cases and activity
    const subscription = supabase
      .channel('hr_dashboard_activity')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'cases' },
        (payload) => {
          setAllCases(prev => [payload.new, ...prev]);
          if (payload.new.status === 'pending') {
            setPendingCases(prev => [payload.new, ...prev]);
            toast.info(`🚨 New case filed: ${payload.new.case_number}`);
          }
          // Refresh activity feed
          fetchRecentActivity();
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
          fetchRecentActivity();
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'case_reviews' },
        () => {
          fetchRecentActivity();
          toast.info('📋 New case review completed');
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'evidence' },
        () => {
          fetchRecentActivity();
          toast.info('📎 New evidence uploaded');
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getActivityIcon = (iconName: string) => {
    const iconProps = { className: "h-4 w-4" };
    switch (iconName) {
      case 'FileText': return <FileText {...iconProps} />;
      case 'CheckCircle': return <CheckCircle {...iconProps} />;
      case 'Upload': return <Bell {...iconProps} />; // Using Bell for upload
      case 'Clock': return <Clock {...iconProps} />;
      default: return <Bell {...iconProps} />;
    }
  };

  const getActivityColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'purple': return 'bg-purple-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-primary';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

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
              {loadingActivity ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start space-x-3 p-3 rounded-lg border border-border bg-background animate-pulse">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 bg-muted rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-3 bg-muted rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-muted rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium mb-2">No Recent Activity</p>
                  <p className="text-sm">Activity will appear here as cases are filed and processed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${getActivityColor(activity.color)}`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getActivityIcon(activity.icon)}
                          <p className="text-sm font-medium text-foreground">{activity.title}</p>
                          {activity.priority && (
                            <Badge 
                              variant={activity.priority === 'high' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {activity.priority}
                            </Badge>
                          )}
                          {activity.urgency && (
                            <Badge 
                              variant={activity.urgency === 'high' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {activity.urgency}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}

                  <div className="text-center pt-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => fetchRecentActivity()}
                    >
                      Refresh Activity
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default HRDashboard;