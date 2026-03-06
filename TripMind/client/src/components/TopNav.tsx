import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Plane } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function TopNav() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 text-white">
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <span className="font-display font-bold text-xl text-primary tracking-tight">TripMind</span>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                {user.user_metadata?.full_name ? `Hi, ${user.user_metadata.full_name.split(' ')[0]}` : user.email}
              </span>
            </div>
            <Avatar className="h-9 w-9 ring-2 ring-primary/10">
              <AvatarImage src={user.user_metadata?.avatar_url || user.user_metadata?.picture || ""} alt={user.user_metadata?.full_name || "User"} />
              <AvatarFallback className="bg-accent/10 text-accent font-semibold">
                {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={() => logout()} title="Log out" className="text-muted-foreground hover:text-danger hover:bg-danger/10">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
