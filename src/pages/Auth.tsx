import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Shield, Users, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Redirect authenticated users
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/hr-dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Sign In Failed",
            description: "Invalid email or password. Please check your credentials and try again.",
            variant: "destructive",
          });
        } else if (error.message.includes("Email not confirmed")) {
          toast({
            title: "Email Not Confirmed",
            description: "Please check your email and click the confirmation link before signing in.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign In Error",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Welcome Back!",
          description: "You have been successfully signed in.",
        });
        // Redirect will happen automatically via auth state change
      }
    } catch (error) {
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!role) {
      toast({
        title: "Role Required",
        description: "Please select your role in the organization.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            role: role,
            department: department,
            employee_id: employeeId,
          }
        }
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          toast({
            title: "Account Exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
          setActiveTab("login");
        } else if (error.message.includes("Password should be")) {
          toast({
            title: "Weak Password",
            description: "Password should be at least 6 characters long.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign Up Error",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Account Created!",
          description: "Please check your email for a confirmation link to complete your registration.",
        });
        setActiveTab("login");
      }
    } catch (error) {
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">POSH-AI</h1>
          </div>
          <p className="text-muted-foreground">
            Secure case management system for POSH compliance
          </p>
        </div>

        {/* Security Notice */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This system handles confidential legal cases. Access is restricted to authorized personnel only.
          </AlertDescription>
        </Alert>

        {/* Auth Form */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Access Your Account</CardTitle>
            <CardDescription>
              Sign in to access the POSH case management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your.email@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={role} onValueChange={setRole} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hr_admin">HR Administrator</SelectItem>
                        <SelectItem value="icc_primary">ICC Primary Member</SelectItem>
                        <SelectItem value="icc_secondary">ICC Secondary Member</SelectItem>
                        <SelectItem value="investigator">Investigator</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        type="text"
                        placeholder="HR, IT, Finance..."
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employee-id">Employee ID</Label>
                      <Input
                        id="employee-id"
                        type="text"
                        placeholder="EMP001"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Role Information */}
        <Card className="border-muted">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>System Roles</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <div><strong>HR Administrator:</strong> Full system access and case management</div>
            <div><strong>ICC Member:</strong> Case review and investigation oversight</div>
            <div><strong>Investigator:</strong> Access to assigned cases and evidence</div>
            <div><strong>Employee:</strong> File complaints and view own submissions</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;