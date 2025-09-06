import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/AppHeader";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp,
  TrendingDown,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  Calendar,
  BarChart3,
  Target,
  Activity
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, subDays, startOfDay, endOfDay } from "date-fns";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000'];

const HRReports = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalCases: 0,
    activeCases: 0,
    resolvedCases: 0,
    overdueDeadlines: 0,
    avgResolutionTime: 0,
    statusDistribution: [] as Array<{name: string, value: number, percentage: string}>,
    priorityDistribution: [] as Array<{name: string, value: number, percentage: string}>,
    casesTrend: [] as Array<{date: string, cases: number, cumulative: number}>,
    evidenceStats: {
      totalEvidence: 0,
      avgEvidencePerCase: '0',
      avgEvidenceScore: '0'
    },
    complianceStats: {
      totalDeadlines: 0,
      pendingDeadlines: 0,
      completedDeadlines: 0,
      overdueRate: '0'
    },
    investigationPathways: [] as Array<{name: string, value: number, percentage: string}>
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch all data needed for analytics
        const [
          { data: cases },
          { data: deadlines },
          { data: evidence },
          { data: reviews }
        ] = await Promise.all([
          supabase.from('cases').select('*').order('created_at', { ascending: false }),
          supabase.from('compliance_deadlines').select('*'),
          supabase.from('evidence').select('*'),
          supabase.from('case_reviews').select('*')
        ]);

        if (!cases) throw new Error('Failed to fetch cases');

        const now = new Date();
        const thirtyDaysAgo = subDays(now, 30);

        // Calculate basic stats
        const totalCases = cases.length;
        const activeCases = cases.filter(c => !['closed'].includes(c.status)).length;
        const resolvedCases = cases.filter(c => c.status === 'closed').length;
        
        // Calculate overdue deadlines
        const overdueDeadlines = deadlines?.filter(d => 
          d.status === 'pending' && parseISO(d.deadline_date) < now
        ).length || 0;

        // Calculate average resolution time
        const resolvedCasesWithDates = cases.filter(c => 
          c.status === 'closed' && c.resolution_date && c.created_at
        );
        const avgResolutionTime = resolvedCasesWithDates.length > 0 
          ? resolvedCasesWithDates.reduce((sum, c) => {
              const created = parseISO(c.created_at);
              const resolved = parseISO(c.resolution_date!);
              return sum + (resolved.getTime() - created.getTime());
            }, 0) / resolvedCasesWithDates.length / (1000 * 60 * 60 * 24) // Convert to days
          : 0;

        // Status distribution
        const statusCounts = cases.reduce((acc: Record<string, number>, c) => {
          acc[c.status] = (acc[c.status] || 0) + 1;
          return acc;
        }, {});
        
        const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
          name: status.replace('_', ' '),
          value: count as number,
          percentage: (((count as number) / totalCases) * 100).toFixed(1)
        }));

        // Priority distribution
        const priorityCounts = cases.reduce((acc: Record<string, number>, c) => {
          acc[c.priority] = (acc[c.priority] || 0) + 1;
          return acc;
        }, {});
        
        const priorityDistribution = Object.entries(priorityCounts).map(([priority, count]) => ({
          name: priority,
          value: count as number,
          percentage: (((count as number) / totalCases) * 100).toFixed(1)
        }));

        // Cases trend (last 30 days)
        const casesTrend = [];
        for (let i = 29; i >= 0; i--) {
          const date = subDays(now, i);
          const dayStart = startOfDay(date);
          const dayEnd = endOfDay(date);
          
          const casesOnDay = cases.filter(c => {
            const createdDate = parseISO(c.created_at);
            return createdDate >= dayStart && createdDate <= dayEnd;
          }).length;

          casesTrend.push({
            date: format(date, 'MMM dd'),
            cases: casesOnDay,
            cumulative: cases.filter(c => parseISO(c.created_at) <= dayEnd).length
          });
        }

        // Evidence statistics
        const evidenceStats = {
          totalEvidence: evidence?.length || 0,
          avgEvidencePerCase: evidence && totalCases > 0 ? (evidence.length / totalCases).toFixed(1) : '0',
          avgEvidenceScore: evidence && evidence.length > 0 
            ? (evidence.reduce((sum, e) => sum + e.score, 0) / evidence.length).toFixed(1) 
            : '0'
        };

        // Compliance statistics
        const complianceStats = {
          totalDeadlines: deadlines?.length || 0,
          pendingDeadlines: deadlines?.filter(d => d.status === 'pending').length || 0,
          completedDeadlines: deadlines?.filter(d => d.status === 'completed').length || 0,
          overdueRate: deadlines && deadlines.length > 0 
            ? ((overdueDeadlines / deadlines.length) * 100).toFixed(1)
            : '0'
        };

        // Investigation pathways
        const pathwayCounts = reviews?.reduce((acc: Record<string, number>, r) => {
          acc[r.investigation_pathway] = (acc[r.investigation_pathway] || 0) + 1;
          return acc;
        }, {}) || {};

        const investigationPathways = Object.entries(pathwayCounts).map(([pathway, count]) => ({
          name: pathway,
          value: count as number,
          percentage: reviews && reviews.length > 0 ? (((count as number) / reviews.length) * 100).toFixed(1) : '0'
        }));

        setAnalytics({
          totalCases,
          activeCases,
          resolvedCases,
          overdueDeadlines,
          avgResolutionTime: Math.round(avgResolutionTime),
          statusDistribution,
          priorityDistribution,
          casesTrend,
          evidenceStats,
          complianceStats,
          investigationPathways
        });

      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader userRole="hr" showNavigation={true} />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader userRole="hr" showNavigation={true} />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">HR Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Critical insights and performance metrics from case management data
          </p>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Cases</p>
                  <p className="text-2xl font-bold">{analytics.totalCases}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Cases</p>
                  <p className="text-2xl font-bold">{analytics.activeCases}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold">{analytics.resolvedCases}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold">{analytics.overdueDeadlines}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Avg Resolution</p>
                  <p className="text-2xl font-bold">{analytics.avgResolutionTime}d</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Cases Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Cases Trend (Last 30 Days)
              </CardTitle>
              <CardDescription>
                Daily case creation and cumulative totals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.casesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="cases" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6}
                    name="Daily Cases"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Case Status Distribution
              </CardTitle>
              <CardDescription>
                Current status breakdown of all cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.statusDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {analytics.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Priority Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Priority Distribution
              </CardTitle>
              <CardDescription>
                Case priority levels breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.priorityDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Investigation Pathways */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Investigation Pathways
              </CardTitle>
              <CardDescription>
                Distribution of investigation approaches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.investigationPathways}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#ffc658"
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {analytics.investigationPathways.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Evidence Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Evidence Analytics
              </CardTitle>
              <CardDescription>
                Evidence collection and scoring metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Evidence Items</span>
                  <Badge variant="outline">{analytics.evidenceStats.totalEvidence}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average per Case</span>
                  <Badge variant="outline">{analytics.evidenceStats.avgEvidencePerCase}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Evidence Score</span>
                  <Badge variant="outline">{analytics.evidenceStats.avgEvidenceScore}%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Compliance Metrics
              </CardTitle>
              <CardDescription>
                Deadline management and compliance rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Deadlines</span>
                  <Badge variant="outline">{analytics.complianceStats.totalDeadlines}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pending Deadlines</span>
                  <Badge variant="secondary">{analytics.complianceStats.pendingDeadlines}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Completed Deadlines</span>
                  <Badge variant="default">{analytics.complianceStats.completedDeadlines}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Overdue Rate</span>
                  <Badge variant={
                    parseFloat(analytics.complianceStats.overdueRate) > 20 ? "destructive" :
                    parseFloat(analytics.complianceStats.overdueRate) > 10 ? "secondary" : "default"
                  }>
                    {analytics.complianceStats.overdueRate}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default HRReports;