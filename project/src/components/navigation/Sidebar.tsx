import { useNavigate, useLocation } from 'react-router-dom';
import { 
  X, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  UserCircle, 
  Settings,
  PieChart,
  FileText,
  MessageSquare,
  BrainCircuit
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      roles: ['doctor', 'patient', 'admin', 'assistant'],
    },
    {
      label: 'Appointments',
      icon: Calendar,
      href: '/appointments',
      roles: ['doctor', 'patient', 'admin', 'assistant'],
    },
    {
      label: 'Find Doctors',
      icon: UserCircle,
      href: '/doctors',
      roles: ['patient'],
    },
    {
      label: 'Analytics',
      icon: PieChart,
      href: '/analytics',
      roles: ['doctor', 'patient'],
    },
    {
      label: 'Profile',
      icon: Settings,
      href: '/profile',
      roles: ['doctor', 'patient', 'admin', 'assistant'],
    },
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user.role)
  );
  
  const navigateAndClose = (href: string) => {
    navigate(href);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r shadow-lg md:shadow-none transition-transform duration-300 transform",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span className="font-semibold">EmotiSense</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Scrollable nav area */}
        <ScrollArea className="h-[calc(100vh-64px)]">
          <div className="p-4">
            <div className="mb-6">
              <p className="text-xs font-medium text-muted-foreground mb-2">ROLE</p>
              <p className="text-sm font-medium capitalize">{user.role}</p>
            </div>
            
            <nav className="space-y-1">
              {filteredNavItems.map((item) => (
                <Button
                  key={item.href}
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive(item.href) ? "bg-secondary" : ""
                  )}
                  onClick={() => navigateAndClose(item.href)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default Sidebar;