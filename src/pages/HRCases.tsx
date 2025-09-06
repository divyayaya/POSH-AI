import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppHeader } from "@/components/AppHeader";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Search, 
  Filter,
  Eye,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  User
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from "date-fns";

const HRCases = () => {
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const { data: casesData, error } = await supabase
          .from('cases')
          .select(`
            *,
            evidence(id, type, score),
            compliance_deadlines(deadline_date, deadline_type, urgency_level, status),
            case_reviews(id, investigation_pathway, credibility_assessment)
          `)
          .order('updated_at', { ascending: false });

        if (error) throw error;

        setCases(casesData || []);
        setFilteredCases(casesData || []);
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
      .channel('hr_cases')
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

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(case_ => 
        case_.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.complainant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.respondent_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(case_ => case_.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(case_ => case_.priority === priorityFilter);
    }

    setFilteredCases(filtered);
  }, [cases, searchTerm, statusFilter, priorityFilter]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'under_review':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'investigating':
        return <Search className="h-4 w-4 text-purple-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'under_review':
        return 'default';
      case 'investigating':
        return 'outline';
      case 'resolved':
        return 'default';
      case 'closed':
        return 'secondary';
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

  const getOverdueDeadlines = (deadlines) => {
    if (!deadlines || deadlines.length === 0) return 0;
    const now = new Date();
    return deadlines.filter(deadline => 
      deadline.status === 'pending' && 
      parseISO(deadline.deadline_date) < now
    ).length;
  };

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Case Management</h1>
          <p className="text-muted-foreground">
            View and manage all cases in the system
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
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

              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Total: {filteredCases.length} cases</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cases Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Cases
            </CardTitle>
            <CardDescription>
              Detailed view of all cases with current status and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case Number</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Parties</TableHead>
                    <TableHead>Evidence</TableHead>
                    <TableHead>Deadlines</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((case_) => {
                    const overdueCount = getOverdueDeadlines(case_.compliance_deadlines);
                    const evidenceCount = case_.evidence?.length || 0;
                    const hasReview = case_.case_reviews?.length > 0;

                    return (
                      <TableRow key={case_.id}>
                        <TableCell className="font-medium">
                          {case_.case_number}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium truncate max-w-[200px]">
                              {case_.title}
                            </div>
                            {hasReview && (
                              <div className="text-xs text-muted-foreground">
                                Pathway: {case_.case_reviews[0].investigation_pathway}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(case_.status)}
                            <Badge variant={getStatusVariant(case_.status)}>
                              {case_.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityVariant(case_.priority)}>
                            {case_.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              <span className="truncate max-w-[100px]">
                                {case_.complainant_name}
                              </span>
                            </div>
                            <div className="text-muted-foreground text-xs mt-1">
                              vs {case_.respondent_name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{evidenceCount}</span>
                            {case_.evidence_score > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {case_.evidence_score}%
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {case_.compliance_deadlines?.length || 0}
                            </span>
                            {overdueCount > 0 && (
                              <div className="flex items-center space-x-1">
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                <span className="text-xs text-red-500">
                                  {overdueCount}
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(parseISO(case_.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/investigation/${case_.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredCases.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No cases found matching your filters.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default HRCases;