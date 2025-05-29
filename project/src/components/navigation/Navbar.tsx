import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  BrainCircuit, 
  Bell, 
  User as UserIcon, 
  Moon, 
  Sun, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onMenuButtonClick: () => void;
}

const Navbar = ({ onMenuButtonClick }: NavbarProps) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Track scrolling to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-200 backdrop-blur-sm",
        scrolled ? "bg-background/90 shadow-sm" : "bg-transparent",
        isAuthenticated ? "md:pl-0" : ""
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Menu button (mobile) and Logo */}
        <div className="flex items-center">
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-2"
              onClick={onMenuButtonClick}
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
          
          <Link to="/" className="flex items-center gap-2">
            <BrainCircuit className="h-7 w-7 text-primary" />
            <span className="font-bold text-lg text-foreground">EmotiSense</span>
          </Link>
        </div>

        {/* Right: Nav Links and User Menu */}
        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Log In
              </Button>
              <Button variant="default" onClick={() => navigate('/register')}>
                Sign Up
              </Button>
            </>
          ) : (
            <>
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="px-4 py-3 font-medium">Notifications</div>
                  <DropdownMenuSeparator />
                  <div className="py-6 text-center text-muted-foreground">
                    No new notifications
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Toggle */}
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                      <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;