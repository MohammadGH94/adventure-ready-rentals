import { Search, User, Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import UserMenu from "@/components/auth/UserMenu";

const Header = () => {
  const { user } = useAuth();
  
  return (
    <header className="bg-card border-b border-border shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              CiKr
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search gear..."
                className="pl-10 search-bar border-0 h-10"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/browse" className="text-foreground hover:text-primary transition-adventure">
              Browse
            </Link>
            <Link to="/how-it-works" className="text-foreground hover:text-primary transition-adventure">
              How it works
            </Link>
            <Link to="/architecture" className="text-foreground hover:text-primary transition-adventure">
              Architecture
            </Link>
            <Link to="/list-gear" className="text-foreground hover:text-primary transition-adventure">
              List your gear
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="hidden sm:flex" asChild>
                  <Link to="/favorites">
                    <Heart className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="hidden sm:flex" asChild>
                  <Link to="/my-rentals">
                    <ShoppingBag className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="action" size="sm" className="hidden sm:flex">
                  <Link to="/dashboard">
                    Dashboard
                  </Link>
                </Button>
                <UserMenu />
              </>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link to="/signin">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;