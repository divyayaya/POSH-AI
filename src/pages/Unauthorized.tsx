import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-destructive/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this resource
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Your current role: <strong>{profile?.role?.replace('_', ' ').toUpperCase()}</strong></p>
            <p>Department: <strong>{profile?.department || 'Not specified'}</strong></p>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={() => navigate("/hr-dashboard")} 
              className="w-full"
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
            
            <Button 
              onClick={signOut} 
              className="w-full"
              variant="destructive"
            >
              Sign Out
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            <p>If you believe this is an error, please contact your HR administrator.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;