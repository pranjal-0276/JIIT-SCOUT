import { Link, NavLink, useNavigate } from "react-router-dom";
import { Compass, LogOut, MapPin, MessageCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { to: "/map", label: "Map", icon: MapPin },
  { to: "/chatbot", label: "Chatbot", icon: MessageCircle },
  { to: "/explore", label: "360° Tour", icon: Compass },
];

export const Navbar = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-elegant">
            <Compass className="h-5 w-5" />
          </div>
          <span className="bg-gradient-primary bg-clip-text text-transparent">JIIT SCOUT</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`
              }
            >
              <Shield className="h-4 w-4" />
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/");
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          ) : (
            <Button size="sm" onClick={() => navigate("/auth")}>
              Admin Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};