import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Filter, Clock, AlertTriangle, CheckCircle, User } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

const ICCCases = () => {
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    const fetchCases = async () => {
      try {
        // Fetch all cases that an ICC member should see
        const { data, error } = await supabase
          .from('cases')
          .select(`
            *,
            evidence (id, type, score),
            compliance_deadlines (deadline_date, deadline_type, status),
            case_reviews (id, review_type, investigation_pathway)
          `)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        
        setCases(data || []);
        setFilteredCases(data || []);
      } catch (error) {
        console.error('Error fetching cases:', error);
        toast.error('Failed to load cases');
      } finally {
        setLoading(false);
      }
    };

    fetchCases();

    // Set up real-time subscription
    const subscription = supabase
      .channel('icc_cases_table')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'cases' },
        () => {
          fetchCases();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let filtered = cases;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(case_ => 
        case_.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.complainant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.respondent_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(case_ => case_.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(case_ => case_.priority === priorityFilter);
    }

    setFilteredCases(filtered);
  }, [cases, searchTerm, statusFilter, priorityFilter]);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'investigating':
        return 'default';
      case 'under_review':
        return 'outline';
      case 'resolved':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getDaysToDeadline = (case_) => {
    const deadline = case_.compliance_deadlines?.[0]?.deadline_date;
    if (!deadline) return null;
    
    const daysLeft = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader userRole="icc" showNavigation={true} />
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
      <AppHeader userRole="icc" showNavigation={true} />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Cases Management</h1>
          <p className="text-muted-foreground">
            View and manage all POSH Act compliance cases
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">
                    {cases.filter(c => c.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Investigating</p>
                  <p className="text-2xl font-bold">
                    {cases.filter(c => c.status === 'investigating').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                  <p className="text-2xl font-bold">
                    {cases.filter(c => c.status === 'under_review').length}
                  </p>
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
                  <p className="text-2xl font-bold">
                    {cases.filter(c => c.status === 'resolved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Filter className="mr-2 h-4 w-4" />
                {filteredCases.length} of {cases.length} cases
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cases Table */}
        <Card>
          <CardHeader>
            <CardTitle>Cases Overview</CardTitle>
            <CardDescription>
              Complete list of all cases under ICC jurisdiction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case Number</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Complainant</TableHead>
                    <TableHead>Respondent</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No cases found matching the current filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCases.map((case_) => {
                      const daysToDeadline = getDaysToDeadline(case_);
                      
                      return (
                        <TableRow key={case_.id}>
                          <TableCell className="font-medium">
                            {case_.case_number}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={case_.title}>
                              {case_.title}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(case_.status)}>
                              {case_.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getPriorityVariant(case_.priority)}>
                              {case_.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>{case_.complainant_name}</TableCell>
                          <TableCell>{case_.respondent_name}</TableCell>
                          <TableCell>
                            {daysToDeadline !== null && (
                              <div className={`text-sm ${
                                daysToDeadline <= 7 ? 'text-red-600 font-semibold' :
                                daysToDeadline <= 30 ? 'text-orange-600' :
                                'text-muted-foreground'
                              }`}>
                                {daysToDeadline > 0 ? `${daysToDeadline} days` : 'Overdue'}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(case_.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {case_.status === 'pending' ? (
                                <Button size="sm" variant="outline" asChild>
                                  <Link to={`/human-review/${case_.id}`}>
                                    Review
                                  </Link>
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" asChild>
                                  <Link to={`/investigation/${case_.id}`}>
                                    View
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ICCCases;