import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { format, isSameDay, parseISO } from "date-fns";

const HRCalendar = () => {
  const [deadlines, setDeadlines] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateDeadlines, setSelectedDateDeadlines] = useState([]);

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        // Fetch all compliance deadlines with associated case information
        const { data: deadlinesData, error: deadlinesError } = await supabase
          .from('compliance_deadlines')
          .select(`
            *,
            cases (
              case_number,
              title,
              status,
              priority,
              complainant_name,
              respondent_name
            )
          `)
          .order('deadline_date', { ascending: true });

        if (deadlinesError) throw deadlinesError;

        // Also fetch cases for additional context
        const { data: casesData, error: casesError } = await supabase
          .from('cases')
          .select('*')
          .order('created_at', { ascending: false });

        if (casesError) throw casesError;

        setDeadlines(deadlinesData || []);
        setCases(casesData || []);
      } catch (error) {
        console.error('Error fetching deadlines:', error);
        toast.error('Failed to load calendar data');
      } finally {
        setLoading(false);
      }
    };

    fetchDeadlines();

    // Set up real-time subscription
    const subscription = supabase
      .channel('hr_calendar_deadlines')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'compliance_deadlines' },
        () => {
          fetchDeadlines();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Filter deadlines for the selected date
    const dateDeadlines = deadlines.filter(deadline => 
      isSameDay(parseISO(deadline.deadline_date), selectedDate)
    );
    setSelectedDateDeadlines(dateDeadlines);
  }, [selectedDate, deadlines]);

  const getDeadlineTypeColor = (type) => {
    switch (type) {
      case 'investigation_completion':
        return 'bg-blue-500';
      case 'final_report':
        return 'bg-purple-500';
      case 'action_implementation':
        return 'bg-green-500';
      case 'review_meeting':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getUrgencyVariant = (urgency) => {
    switch (urgency) {
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDaysUntilDeadline = (deadlineDate) => {
    const today = new Date();
    const deadline = parseISO(deadlineDate);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get dates that have deadlines for calendar highlighting
  const datesWithDeadlines = deadlines.map(deadline => parseISO(deadline.deadline_date));

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

  const upcomingDeadlines = deadlines
    .filter(deadline => getDaysUntilDeadline(deadline.deadline_date) >= 0)
    .sort((a, b) => parseISO(a.deadline_date).getTime() - parseISO(b.deadline_date).getTime())
    .slice(0, 5);

  const overdueDeadlines = deadlines.filter(deadline => 
    getDaysUntilDeadline(deadline.deadline_date) < 0 && deadline.status !== 'completed'
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader userRole="hr" showNavigation={true} />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">HR Compliance Calendar</h1>
          <p className="text-muted-foreground">
            Track and manage case deadlines and compliance requirements
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold">{overdueDeadlines.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">
                    {deadlines.filter(d => {
                      const days = getDaysUntilDeadline(d.deadline_date);
                      return days >= 0 && days <= 7;
                    }).length}
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
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">
                    {deadlines.filter(d => d.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Calendar and Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Calendar View
              </CardTitle>
              <CardDescription>
                Click on a date to view deadlines for that day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{
                  hasDeadline: datesWithDeadlines,
                }}
                modifiersStyles={{
                  hasDeadline: {
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    fontWeight: 'bold',
                  },
                }}
              />
              
              {/* Selected Date Details */}
              {selectedDateDeadlines.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">
                    Deadlines for {format(selectedDate, 'MMMM d, yyyy')}
                  </h3>
                  <div className="space-y-3">
                    {selectedDateDeadlines.map((deadline) => (
                      <div key={deadline.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(deadline.status)}
                            <span className="font-medium">{deadline.deadline_type.replace('_', ' ')}</span>
                          </div>
                          <Badge variant={getUrgencyVariant(deadline.urgency_level)}>
                            {deadline.urgency_level}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Case: {deadline.cases?.case_number} - {deadline.cases?.title}
                        </p>
                        <p className="text-sm">{deadline.description}</p>
                        <div className="mt-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/investigation/${deadline.case_id}`}>
                              View Case
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sidebar with Upcoming and Overdue */}
          <div className="space-y-6">
            {/* Overdue Deadlines */}
            {overdueDeadlines.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Overdue Deadlines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {overdueDeadlines.slice(0, 3).map((deadline) => (
                      <div key={deadline.id} className="border border-red-200 bg-red-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{deadline.deadline_type.replace('_', ' ')}</span>
                          <span className="text-xs text-red-600">
                            {Math.abs(getDaysUntilDeadline(deadline.deadline_date))} days overdue
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {deadline.cases?.case_number}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingDeadlines.map((deadline) => {
                    const daysUntil = getDaysUntilDeadline(deadline.deadline_date);
                    return (
                      <div key={deadline.id} className="border border-border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{deadline.deadline_type.replace('_', ' ')}</span>
                          <span className={`text-xs ${
                            daysUntil <= 7 ? 'text-red-600 font-semibold' :
                            daysUntil <= 30 ? 'text-orange-600' :
                            'text-muted-foreground'
                          }`}>
                            {daysUntil === 0 ? 'Today' : `${daysUntil} days`}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {deadline.cases?.case_number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(deadline.deadline_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HRCalendar;