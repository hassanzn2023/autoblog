
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/toaster";

interface AuthPageProps {
  defaultTab?: 'signin' | 'signup';
}

const AuthPage: React.FC<AuthPageProps> = ({ defaultTab = 'signin' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [currentTab, setCurrentTab] = useState<'signin' | 'signup'>(defaultTab);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Get return URL from location state or default to '/'
  const from = location.state?.from || '/';
  
  // Check if there's an error in URL params
  useEffect(() => {
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');
    
    if (errorCode || errorDescription) {
      console.error("Auth error from URL:", errorCode, errorDescription);
      setAuthError(errorDescription?.replace(/\+/g, ' ') || 'Authentication error occurred');
      toast({
        title: "Authentication Error",
        description: errorDescription?.replace(/\+/g, ' ') || 'Authentication error occurred',
        variant: "destructive"
      });
    }
  }, [searchParams]);

  console.log("AuthPage - from path:", from);

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("AuthPage - checking current session:", data.session);
      if (data.session) {
        console.log("AuthPage - user already logged in, redirecting to:", from);
        navigate(from, { replace: true });
      }
    };
    
    checkUser();
  }, [navigate, from]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      console.log("Attempting to sign in with:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log("Sign in successful:", data);
      toast({
        title: "Success",
        description: "Signed in successfully"
      });
      
      // Redirect to the requested page or home
      console.log("Redirecting after signin to:", from);
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error("Sign in error:", error);
      setAuthError(error.message || "Failed to sign in");
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    if (!email || !password || !firstName || !lastName) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      console.log("Attempting to sign up with:", email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) throw error;
      
      console.log("Sign up response:", data);
      
      if (data.user && !data.session) {
        // User was created but needs email confirmation
        setEmailSent(true);
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link. Please check your email to verify your account."
        });
      } else if (data.session) {
        // Auto-login if no email confirmation is needed
        toast({
          title: "Success",
          description: "Account created successfully!"
        });
        console.log("User session available after signup, redirecting to:", from);
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      setAuthError(error.message || "Failed to create account");
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      console.log("Attempting Google sign in");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${from}`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Google sign in error:", error);
      setAuthError(error.message || "Failed to sign in with Google");
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  // Email verification success screen
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a verification link to <span className="font-medium">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800">
                    Please click on the verification link in your email to complete your registration. 
                    After verification, you will be automatically redirected to the application.
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => setEmailSent(false)} 
              variant="outline" 
              className="w-full"
            >
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-100 p-4">
      <Toaster />
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden md:flex flex-col p-8 text-center items-center justify-center">
          <div className="w-24 h-24 mb-6 rounded-full bg-[#F76D01]/10 flex items-center justify-center">
            <svg className="w-12 h-12 text-[#F76D01]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16L6 10H18L12 16Z" fill="currentColor"/>
              <path d="M12 3V10M12 3L7 8M12 3L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M19 13.5V21H5V13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">SEO Platform</h1>
          <p className="text-gray-600 mb-6">
            Optimize your content and boost your search rankings with our powerful SEO tools
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-center">
              <div className="bg-green-100 p-1 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <p className="ml-3 text-sm">Content optimization with AI assistance</p>
            </div>
            <div className="flex items-center">
              <div className="bg-green-100 p-1 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <p className="ml-3 text-sm">Keyword research and analysis</p>
            </div>
            <div className="flex items-center">
              <div className="bg-green-100 p-1 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <p className="ml-3 text-sm">Automated blogging and content generation</p>
            </div>
            <div className="flex items-center">
              <div className="bg-green-100 p-1 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <p className="ml-3 text-sm">Detailed performance analytics</p>
            </div>
          </div>
        </div>
        
        {/* Right side - Auth Form */}
        <div>
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-2 md:hidden">
                <div className="w-16 h-16 rounded-full bg-[#F76D01]/10 flex items-center justify-center">
                  <svg className="w-10 h-10 text-[#F76D01]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 16L6 10H18L12 16Z" fill="currentColor"/>
                    <path d="M12 3V10M12 3L7 8M12 3L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M19 13.5V21H5V13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">SEO Platform</CardTitle>
              <CardDescription className="text-center">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            
            {authError && (
              <CardContent className="pt-0">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              </CardContent>
            )}
            
            <Tabs defaultValue={currentTab} onValueChange={(value) => setCurrentTab(value as 'signin' | 'signup')}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn}>
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input 
                        id="signin-email" 
                        type="email" 
                        placeholder="name@example.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password">Password</Label>
                      </div>
                      <Input 
                        id="signin-password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} 
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#F76D01] hover:bg-[#E65D00]" 
                      disabled={loading}
                    >
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                    >
                      <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google
                    </Button>
                    
                    <p className="text-center text-sm text-gray-500 mt-4">
                      Don't have an account?{" "}
                      <button 
                        type="button" 
                        className="text-[#F76D01] hover:underline" 
                        onClick={() => setCurrentTab('signup')}
                      >
                        Sign up
                      </button>
                    </p>
                  </CardContent>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp}>
                  <CardContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First Name</Label>
                        <Input 
                          id="first-name" 
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last Name</Label>
                        <Input 
                          id="last-name" 
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)} 
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="name@example.com" 
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} 
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#F76D01] hover:bg-[#E65D00]" 
                      disabled={loading}
                    >
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                    >
                      <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google
                    </Button>
                    
                    <p className="text-center text-sm text-gray-500 mt-4">
                      Already have an account?{" "}
                      <button 
                        type="button" 
                        className="text-[#F76D01] hover:underline" 
                        onClick={() => setCurrentTab('signin')}
                      >
                        Sign in
                      </button>
                    </p>
                  </CardContent>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="p-6 pt-0 text-center text-xs text-gray-500">
              By continuing, you agree to our{" "}
              <a href="#" className="underline">Terms of Service</a>{" "}
              and{" "}
              <a href="#" className="underline">Privacy Policy</a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
