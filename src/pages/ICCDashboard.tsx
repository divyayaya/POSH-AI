import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { AlertTriangle, FileText, Clock, User, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

const ICCDashboard = () => {
  const [pendingCases, setPendingCases] = useState([]);
  const [assignedCases, setAssignedCases] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchICCCases = async () => {
      try {
        // Fetch pending cases (awaiting review)
        const { data: pending, error: pendingError } = await supabase
          .from('cases')
          .select(`
            *,
            evidence (id, type, score),
            compliance_deadlines (deadline_date, deadline_type)
          `)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (pendingError) throw pendingError;

        // Fetch assigned cases (under investigation)
        const { data: assigned, error: assignedError } = await supabase
          .from('cases')
          .select(`
            *,
            evidence (id, type, score),
            compliance_deadlines (deadline_date, deadline_type)
          `)
          .in('status', ['investigating', 'under_review'])
          .order('updated_at', { ascending: false });

        if (assignedError) throw assignedError;

        setPendingCases(pending || []);
        setAssignedCases(assigned || []);
      } catch (error) {
        console.error('Error fetching ICC cases:', error);
        toast.error('Failed to load case data');
      } finally {
        setLoadingData(false);
      }
    };

    fetchICCCases();

    // Set up real-time subscription
    const subscription = supabase
      .channel('icc_cases')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'cases' },
        () => {
          fetchICCCases(); // Refresh data on any case changes
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        userRole="icc"
        showNavigation={true}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Internal Complaints Committee Dashboard
          </h1>
          <p className="text-muted-foreground">
            Review and manage POSH Act compliance cases
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold">{pendingCases.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Under Investigation</p>
                  <p className="text-2xl font-bold">{assignedCases.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Approaching Deadline</p>
                  <p className="text-2xl font-bold">
                    {[...pendingCases, ...assignedCases].filter(c => {
                      const deadline = c.compliance_deadlines?.[0]?.deadline_date;
                      if (!deadline) return false;
                      const daysLeft = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      return daysLeft <= 30;
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">My Active Cases</p>
                  <p className="text-2xl font-bold">{assignedCases.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cases Requiring Action */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Cases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-orange-600" />
                Cases Pending Review
              </CardTitle>
              <CardDescription>
                New cases requiring ICC evaluation and pathway determination
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : pendingCases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
                  <p>No pending cases for review</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingCases.map((case_) => (
                    <div key={case_.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{case_.case_number}</span>
                        <Badge variant={case_.priority === 'high' ? 'destructive' : 'secondary'}>
                          {case_.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {case_.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Filed: {new Date(case_.created_at).toLocaleDateString()}
                        </div>
                        <Button size="sm" asChild>
                          <Link to={`/human-review/${case_.id}`}>
                            Review Case
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assigned Cases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-600" />
                My Assigned Cases
              </CardTitle>
              <CardDescription>
                Cases currently under investigation or requiring action
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignedCases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p>No assigned cases</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedCases.map((case_) => (
                    <div key={case_.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{case_.case_number}</span>
                        <Badge variant="outline">
                          {case_.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {case_.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Updated: {new Date(case_.updated_at).toLocaleDateString()}
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/investigation/${case_.id}`}>
                            Continue Investigation
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ICCDashboard;