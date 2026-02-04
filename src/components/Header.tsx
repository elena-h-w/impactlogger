import { motion } from 'framer-motion';
import { Shield, Sparkles, LogOut, Users, Target } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onGenerateClick?: () => void;
  hasEntries?: boolean;
}

export function Header({
  onGenerateClick,
  hasEntries = false
}: HeaderProps) {
  const { signOut, user } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  const navItems = [
    { path: '/', label: 'Impacts', icon: Target },
    { path: '/stakeholders', label: 'Stakeholders', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-6"
        >
          <Link to="/" className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-amber shadow-amber">
              <Shield className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground">Reputation Builder</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">Your private evidence system</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "gap-2 transition-colors",
                      isActive && "bg-accent/10 text-accent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          {onGenerateClick && (
            <Button
              onClick={onGenerateClick}
              disabled={!hasEntries}
              variant="outline"
              className="gap-2 hover:border-accent hover:text-accent transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Generate Narrative</span>
              <span className="sm:hidden">Generate</span>
            </Button>
          )}
          {user && (
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </motion.div>
      </div>
    </header>
  );
}
