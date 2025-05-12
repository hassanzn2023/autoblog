
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
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

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      console.log("Sending magic link to:", email);
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}${from}`
        }
      });
      
      if (error) throw error;
      
      setMagicLinkSent(true);
      toast({
        title: "Magic Link Sent",
        description: "Check your email for the login link"
      });
      
    } catch (error: any) {
      console.error("Magic link error:", error);
      setAuthError(error.message || "Failed to send magic link");
      toast({
        title: "Error",
        description: error.message || "Failed to send magic link",
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

  // Random testimonial selection
  const testimonials = [
    {
      text: "This platform has revolutionized our content strategy. We've seen a 3x increase in organic traffic since we started using it.",
      author: "Sarah Johnson",
      role: "Marketing Director, TechCorp",
      stars: 5
    },
    {
      text: "The AI-generated articles are indistinguishable from those written by our in-house team. It's saved us countless hours and resources.",
      author: "Michael Chen",
      role: "Content Manager, GrowthBiz",
      stars: 5
    },
    {
      text: "Our blog traffic has grown exponentially since implementing this solution. The quality and SEO optimization are remarkable.",
      author: "Emma Rodriguez",
      role: "SEO Specialist, Digital Edge",
      stars: 5
    }
  ];
  
  const randomTestimonial = testimonials[Math.floor(Math.random() * testimonials.length)];

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left panel - Login form */}
      <div className="flex flex-col justify-center w-full md:w-1/2 p-6 md:p-12 lg:p-20">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-[#F76D01]">Arvow</h1>
          </div>

          <h2 className="text-3xl font-bold mb-8">Generate articles for your business today</h2>
          
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          {magicLinkSent ? (
            <div className="space-y-4 text-center">
              <div className="rounded-lg bg-green-50 p-6 border border-green-100">
                <h3 className="font-semibold text-xl mb-2">Check your email</h3>
                <p className="text-gray-700">
                  We've sent a magic link to <span className="font-semibold">{email}</span>.
                  Click the link in the email to sign in.
                </p>
              </div>
              <button 
                className="text-[#F76D01] underline"
                onClick={() => setMagicLinkSent(false)}
              >
                Try another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleMagicLinkLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} 
                  required
                  className="w-full"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-[#F76D01] hover:bg-[#E65D00] text-white p-6 flex items-center justify-between" 
                disabled={loading}
              >
                <span className="font-semibold text-base">Continue with Email</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-2 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full flex items-center justify-center p-6" 
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5">
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
                <span className="font-semibold text-base">Continue with Google</span>
              </Button>

              <p className="text-xs text-center text-gray-500 mt-6">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          )}
        </div>
      </div>
      
      {/* Right panel - Testimonial */}
      <div className="hidden md:flex md:w-1/2 bg-[#1A1A1A] text-white">
        <div className="flex flex-col justify-center p-12 lg:p-20 max-w-lg mx-auto">
          <div className="mb-6">
            <div className="flex mb-2">
              {[...Array(randomTestimonial.stars)].map((_, i) => (
                <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              ))}
            </div>
          </div>
          
          <blockquote className="text-xl md:text-2xl font-medium mb-8">
            "{randomTestimonial.text}"
          </blockquote>
          
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mr-4">
              <span className="text-xl font-bold">{randomTestimonial.author.charAt(0)}</span>
            </div>
            <div>
              <p className="font-semibold">{randomTestimonial.author}</p>
              <p className="text-sm text-gray-400">{randomTestimonial.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
