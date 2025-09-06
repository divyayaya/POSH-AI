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
  Plus,
  TrendingUp,
  Target,
  Calendar as CalendarDateIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { format, isSameDay, parseISO, isToday, isTomorrow } from "date-fns";

const Calendar = () => {
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
      .channel('calendar_deadlines')
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
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-500' };
      case 'final_report':
        return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-500' };
      case 'action_implementation':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-500' };
      case 'review_meeting':
        return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-500' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: 'text-gray-500' };
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
        return <CalendarDateIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDaysUntilDeadline = (deadlineDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = parseISO(deadlineDate);
    deadline.setHours(0, 0, 0, 0);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDateDisplayText = (deadlineDate) => {
    const deadline = parseISO(deadlineDate);
    if (isToday(deadline)) return "Today";
    if (isTomorrow(deadline)) return "Tomorrow";
    
    const days = getDaysUntilDeadline(deadlineDate);
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `${days} days`;
  };

  // Get dates that have deadlines for calendar highlighting
  const datesWithDeadlines = deadlines.map(deadline => parseISO(deadline.deadline_date));

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader userRole="icc" showNavigation={true} />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground animate-pulse">Loading calendar data...</p>
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
      <AppHeader userRole="icc" showNavigation={true} />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Compliance Calendar</h1>
              <p className="text-muted-foreground">
                Track and manage case deadlines and compliance requirements
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover-scale transition-all duration-300 border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Overdue Deadlines</p>
                  <p className="text-3xl font-bold text-red-600">{overdueDeadlines.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale transition-all duration-300 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">This Week</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {deadlines.filter(d => {
                      const days = getDaysUntilDeadline(d.deadline_date);
                      return days >= 0 && days <= 7;
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale transition-all duration-300 border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold text-green-600">
                    {deadlines.filter(d => d.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Calendar and Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <Card className="lg:col-span-2 animate-scale-in shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
              <CardTitle className="flex items-center text-xl">
                <CalendarIcon className="mr-3 h-6 w-6 text-primary" />
                Calendar View
              </CardTitle>
              <CardDescription className="text-base">
                Click on a date to view deadlines for that day
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="w-full flex justify-center">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-xl border-2 w-full text-lg shadow-inner bg-gradient-to-br from-background to-muted/20"
                  modifiers={{
                    hasDeadline: datesWithDeadlines,
                  }}
                  modifiersStyles={{
                    hasDeadline: {
                      backgroundColor: 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))',
                      fontWeight: 'bold',
                      borderRadius: '8px',
                      transform: 'scale(1.05)',
                    },
                  }}
                />
              </div>
              
              {/* Selected Date Details */}
              {selectedDateDeadlines.length > 0 && (
                <div className="mt-8 animate-fade-in">
                  <div className="flex items-center space-x-2 mb-4">
                    <Target className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold">
                      Deadlines for {format(selectedDate, 'MMMM d, yyyy')}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {selectedDateDeadlines.map((deadline) => {
                      const typeColor = getDeadlineTypeColor(deadline.deadline_type);
                      return (
                        <div key={deadline.id} className={`${typeColor.bg} ${typeColor.border} border-2 rounded-xl p-6 hover-scale transition-all duration-300 hover:shadow-lg`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 ${typeColor.bg} rounded-lg flex items-center justify-center border-2 ${typeColor.border}`}>
                                {getStatusIcon(deadline.status)}
                              </div>
                              <span className={`font-semibold text-lg ${typeColor.text}`}>
                                {deadline.deadline_type.replace('_', ' ').split(' ').map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                              </span>
                            </div>
                            <Badge variant={getUrgencyVariant(deadline.urgency_level)} className="text-sm">
                              {deadline.urgency_level} priority
                            </Badge>
                          </div>
                          <div className={`text-sm ${typeColor.text} mb-3 bg-white/60 rounded-lg p-3`}>
                            <span className="font-medium">Case:</span> {deadline.cases?.case_number} - {deadline.cases?.title}
                          </div>
                          <p className={`text-sm mb-4 ${typeColor.text}`}>{deadline.description}</p>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs ${typeColor.text} bg-white/40 px-3 py-1 rounded-full`}>
                              Due: {format(parseISO(deadline.deadline_date), 'PPP')}
                            </span>
                            <Button size="sm" variant="default" className="hover-scale" asChild>
                              <Link to={`/investigation/${deadline.case_id}`}>
                                View Case Details
                              </Link>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedDateDeadlines.length === 0 && (
                <div className="mt-8 text-center py-8 animate-fade-in">
                  <CalendarDateIcon className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-lg">No deadlines for {format(selectedDate, 'MMMM d, yyyy')}</p>
                  <p className="text-muted-foreground/70 text-sm mt-2">Select a highlighted date to view deadlines</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sidebar with Upcoming and Overdue */}
          <div className="space-y-6">
            {/* Overdue Deadlines */}
            {overdueDeadlines.length > 0 && (
              <Card className="animate-fade-in shadow-lg border-l-4 border-l-red-500">
                <CardHeader className="bg-red-50 border-b">
                  <CardTitle className="flex items-center text-red-700">
                    <AlertTriangle className="mr-3 h-5 w-5" />
                    Overdue Deadlines
                  </CardTitle>
                  <CardDescription className="text-red-600/80">
                    Immediate attention required
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {overdueDeadlines.slice(0, 3).map((deadline) => (
                      <div key={deadline.id} className="bg-red-50 border border-red-200 rounded-lg p-4 hover-scale transition-all duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-semibold text-red-700">
                              {deadline.deadline_type.replace('_', ' ').split(' ').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </span>
                          </div>
                          <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full font-medium">
                            {Math.abs(getDaysUntilDeadline(deadline.deadline_date))} days overdue
                          </span>
                        </div>
                        <p className="text-xs text-red-600/80 font-medium mb-1">
                          Case: {deadline.cases?.case_number}
                        </p>
                        <p className="text-xs text-red-600/70">
                          Due: {format(parseISO(deadline.deadline_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Deadlines */}
            <Card className="animate-fade-in shadow-lg border-l-4 border-l-blue-500">
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="flex items-center text-blue-700">
                  <TrendingUp className="mr-3 h-5 w-5" />
                  Upcoming Deadlines
                </CardTitle>
                <CardDescription className="text-blue-600/80">
                  Next 30 days
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {upcomingDeadlines.map((deadline) => {
                    const daysUntil = getDaysUntilDeadline(deadline.deadline_date);
                    const isUrgent = daysUntil <= 7;
                    const typeColor = getDeadlineTypeColor(deadline.deadline_type);
                    
                    return (
                      <div key={deadline.id} className={`${isUrgent ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4 hover-scale transition-all duration-200`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 ${typeColor.bg} rounded-md flex items-center justify-center`}>
                              <Clock className={`h-3 w-3 ${typeColor.icon}`} />
                            </div>
                            <span className={`text-sm font-semibold ${isUrgent ? 'text-orange-700' : 'text-blue-700'}`}>
                              {deadline.deadline_type.replace('_', ' ').split(' ').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </span>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            daysUntil <= 3 ? 'text-red-600 bg-red-100' :
                            daysUntil <= 7 ? 'text-orange-600 bg-orange-100' :
                            'text-blue-600 bg-blue-100'
                          }`}>
                            {getDateDisplayText(deadline.deadline_date)}
                          </span>
                        </div>
                        <p className={`text-xs font-medium mb-1 ${isUrgent ? 'text-orange-600' : 'text-blue-600'}`}>
                          Case: {deadline.cases?.case_number}
                        </p>
                        <p className={`text-xs ${isUrgent ? 'text-orange-600/70' : 'text-blue-600/70'}`}>
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

export default Calendar;