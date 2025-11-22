import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "signup";
}

export default function AuthDialog({ open, onOpenChange, defaultTab = "login" }: AuthDialogProps) {
  const { login, signup } = useAuth();
  const { toast } = useToast();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      setLoginError(null);
      loginForm.clearErrors();
      await login(data.email, data.password);
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      onOpenChange(false);
      loginForm.reset();
    } catch (error: any) {
      // Check if this is a validation error with details
      const errorData = error?.data || error?.response?.data;
      
      if (errorData?.details && Array.isArray(errorData.details)) {
        // Handle field-specific validation errors
        let hasFieldErrors = false;
        
        errorData.details.forEach((detail: { field: string; message: string }) => {
          const fieldName = detail.field as keyof LoginFormData;
          if (fieldName in loginForm.getValues()) {
            loginForm.setError(fieldName, {
              type: 'server',
              message: detail.message,
            });
            hasFieldErrors = true;
          }
        });
        
        // Set general error message if there's an error field
        if (errorData.error || errorData.message) {
          setLoginError(errorData.error || errorData.message);
        } else if (!hasFieldErrors) {
          setLoginError("Please fix the errors above and try again.");
        }
      } else {
        // Handle general errors
        const message = error?.message || errorData?.message || errorData?.error || "Login failed. Please try again.";
        setLoginError(message);
      }
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    try {
      setSignupError(null);
      // Clear any previous field errors
      signupForm.clearErrors();
      await signup(data.name, data.email, data.phone, data.password);
      toast({
        title: "Account created!",
        description: "Welcome to FundRaiser.",
      });
      onOpenChange(false);
      signupForm.reset();
    } catch (error: any) {
      // Check if this is a validation error with details
      const errorData = error?.data || error?.response?.data;
      
      if (errorData?.details && Array.isArray(errorData.details)) {
        // Handle field-specific validation errors
        let hasFieldErrors = false;
        
        errorData.details.forEach((detail: { field: string; message: string }) => {
          const fieldName = detail.field as keyof SignupFormData;
          // Map backend field names to form field names if needed
          const formFieldName = fieldName === 'phone' ? 'phone' : 
                               fieldName === 'email' ? 'email' :
                               fieldName === 'name' ? 'name' :
                               fieldName === 'password' ? 'password' : fieldName;
          
          if (formFieldName in signupForm.getValues()) {
            signupForm.setError(formFieldName as any, {
              type: 'server',
              message: detail.message,
            });
            hasFieldErrors = true;
          }
        });
        
        // Set general error message if there's an error field
        if (errorData.error || errorData.message) {
          setSignupError(errorData.error || errorData.message);
        } else if (!hasFieldErrors) {
          setSignupError("Please fix the errors above and try again.");
        }
      } else {
        // Handle general errors
        const message = error?.message || errorData?.message || errorData?.error || "Signup failed. Please try again.";
        setSignupError(message);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to FundRaiser</DialogTitle>
          <DialogDescription>
            Sign in to create events and manage your campaigns
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
            <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                          data-testid="input-login-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showLoginPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            data-testid="input-login-password"
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                          >
                            {showLoginPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {loginError && (
                  <div className="text-sm text-destructive" data-testid="login-error">
                    {loginError}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  data-testid="button-login-submit"
                  disabled={loginForm.formState.isSubmitting}
                >
                  {loginForm.formState.isSubmitting ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Logging in...
                    </span>
                  ) : (
                    "Log In"
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                <FormField
                  control={signupForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                          data-testid="input-signup-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                          data-testid="input-signup-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="07XX XXX XXX"
                          {...field}
                          data-testid="input-signup-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          data-testid="input-signup-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          data-testid="input-signup-confirm-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {signupError && (
                  <div className="text-sm text-destructive" data-testid="signup-error">
                    {signupError}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  data-testid="button-signup-submit"
                  disabled={signupForm.formState.isSubmitting}
                >
                  {signupForm.formState.isSubmitting ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
