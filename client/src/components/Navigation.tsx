import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Heart, Plus, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AuthDialog from "./AuthDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navigation() {
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogTab, setAuthDialogTab] = useState<"login" | "signup">("login");

  const handleAuthClick = (tab: "login" | "signup") => {
    setAuthDialogTab(tab);
    setAuthDialogOpen(true);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard" className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-2 py-1 -ml-2">
                <Heart className="h-6 w-6 text-primary fill-primary" />
                <span className="text-xl font-bold">FundRaiser</span>
              </Link>
            ) : (
              <Link href="/" className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-2 py-1 -ml-2">
                <Heart className="h-6 w-6 text-primary fill-primary" />
                <span className="text-xl font-bold">FundRaiser</span>
              </Link>
            )}

            <div className="hidden md:flex items-center gap-6">
              {false && <Link href="/">
                <span className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                  location === '/' ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  Explore Events
                </span>
              </Link>}
              {isAuthenticated && (
                <Link href="/dashboard">
                  <span className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                    location === '/dashboard' ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    Dashboard
                  </span>
                </Link>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Link href="/create">
                    <Button data-testid="button-create-event">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {user?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span className="font-medium">{user?.name}</span>
                          <span className="text-xs text-muted-foreground">{user?.email}</span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} data-testid="button-logout">
                        <LogOut className="h-4 w-4 mr-2" />
                        Log Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => handleAuthClick("login")} data-testid="button-login">
                    Log In
                  </Button>
                  <Button onClick={() => handleAuthClick("signup")} data-testid="button-signup">
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} defaultTab={authDialogTab} />
    </>
  );
}
